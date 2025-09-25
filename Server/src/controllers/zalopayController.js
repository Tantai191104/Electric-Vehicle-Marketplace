import { createZaloPayOrder, queryZaloPayOrder, validateCallbackMAC } from '../config/zalopay.js';
import WalletTopup from '../models/WalletTopup.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create ZaloPay order for wallet topup
 */
export async function createTopupOrder(req, res) {
  try {
    const { amount, description } = req.body;
    const userId = req.user.sub;

    // Validate amount
    if (!amount || amount < 1000) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Số tiền nạp tối thiểu là 1,000 VND'
      });
    }

    if (amount > 50000000) { // 50M VND max
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Số tiền nạp tối đa là 50,000,000 VND'
      });
    }

    // Generate unique order ID
    const orderId = `topup_${userId}_${Date.now()}_${uuidv4().slice(0, 8)}`;

    // Create ZaloPay order
    const zaloPayResult = await createZaloPayOrder({
      orderId,
      amount,
      description,
      userId
    });

    if (!zaloPayResult.success) {
      return res.status(400).json({
        error: 'ZaloPay order creation failed',
        message: zaloPayResult.error,
        zalopay: zaloPayResult.zalopay || zaloPayResult.details
      });
    }

    // Save topup record to database
    const topupRecord = await WalletTopup.create({
      userId,
      orderId,
      app_trans_id: zaloPayResult.data.app_trans_id,
      zp_trans_token: zaloPayResult.data.zp_trans_token,
      amount,
      description: description || `Nạp ${amount} xu vào ví`,
      status: 'pending',
      order_url: zaloPayResult.data.order_url,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Đơn hàng được tạo thành công',
      data: {
        orderId: topupRecord.orderId,
        app_trans_id: topupRecord.app_trans_id,
        amount: topupRecord.amount,
        order_url: topupRecord.order_url,
        status: topupRecord.status
      }
    });

  } catch (error) {
    console.error('Create topup order error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Không thể tạo đơn hàng nạp tiền'
    });
  }
}

/**
 * Handle ZaloPay callback
 */
export async function handleZaloPayCallback(req, res) {
  try {
    const { data, mac } = req.body;
    
    console.log('📥 ZaloPay callback received:', req.body);

    // Validate MAC
    if (!validateCallbackMAC(data, mac)) {
      console.warn('❌ Invalid MAC from ZaloPay callback');
      return res.status(400).json({ 
        return_code: -1, 
        return_message: "Invalid MAC" 
      });
    }

    // Parse callback data
    const callbackData = JSON.parse(data);
    console.log('✅ Parsed callback data:', callbackData);

    const { app_trans_id, zp_trans_id, server_time, amount } = callbackData;

    // Find topup record
    const topupRecord = await WalletTopup.findOne({ app_trans_id });
    if (!topupRecord) {
      console.warn(`⚠️ Topup record not found for app_trans_id: ${app_trans_id}`);
      return res.json({ return_code: 1, return_message: "OK" });
    }

    // Update topup record
    topupRecord.status = 'success';
    topupRecord.zp_trans_id = zp_trans_id;
    topupRecord.payment_time = new Date(server_time);
    topupRecord.callback_data = callbackData;
    await topupRecord.save();

    console.log(`✅ Updated topup record for app_trans_id: ${app_trans_id}`);

    // Update user wallet
    const user = await User.findById(topupRecord.userId);
    if (user) {
      const balanceBefore = user.wallet?.balance || 0;
      user.wallet = user.wallet || {};
      user.wallet.balance = balanceBefore + topupRecord.amount;
      user.wallet.totalDeposited = (user.wallet.totalDeposited || 0) + topupRecord.amount;
      await user.save();

      // Create wallet transaction record
      await WalletTransaction.create({
        userId: topupRecord.userId,
        type: 'deposit',
        amount: topupRecord.amount,
        balanceBefore,
        balanceAfter: user.wallet.balance,
        description: `Nạp tiền qua ZaloPay - ${app_trans_id}`,
        status: 'completed',
        paymentMethod: 'e_wallet',
        reference: `zalopay:${app_trans_id}`,
        metadata: { app_trans_id, zp_trans_id }
      });

      console.log(`🎉 Successfully topped up ${topupRecord.amount} VND for user ${topupRecord.userId}`);
    } else {
      console.warn(`⚠️ User not found: ${topupRecord.userId}`);
    }

    return res.json({ return_code: 1, return_message: "OK" });

  } catch (error) {
    console.error('❌ ZaloPay callback error:', error);
    return res.status(500).json({ 
      return_code: -1, 
      return_message: "Server Error" 
    });
  }
}

/**
 * Query ZaloPay order status
 */
export async function queryOrderStatus(req, res) {
  try {
    const { orderId } = req.params;
    const userId = req.user.sub;

    // Find topup record
    const topupRecord = await WalletTopup.findOne({ 
      orderId, 
      userId 
    });

    if (!topupRecord) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Query ZaloPay status if still pending
    if (topupRecord.status === 'pending') {
      const zaloPayResult = await queryZaloPayOrder(topupRecord.app_trans_id);
      
      if (zaloPayResult.success && zaloPayResult.data.return_code === 1) {
        // Payment successful, update record
        topupRecord.status = 'success';
        topupRecord.zp_trans_id = zaloPayResult.data.zp_trans_id;
        topupRecord.payment_time = new Date();
        await topupRecord.save();

        // Update user wallet
        const user = await User.findById(userId);
        if (user) {
          const balanceBefore = user.wallet?.balance || 0;
          user.wallet = user.wallet || {};
          user.wallet.balance = balanceBefore + topupRecord.amount;
          user.wallet.totalDeposited = (user.wallet.totalDeposited || 0) + topupRecord.amount;
          await user.save();

          // Create wallet transaction record
          await WalletTransaction.create({
            userId,
            type: 'deposit',
            amount: topupRecord.amount,
            balanceBefore,
            balanceAfter: user.wallet.balance,
            description: `Nạp tiền qua ZaloPay - ${topupRecord.app_trans_id}`,
            status: 'completed',
            paymentMethod: 'e_wallet',
            reference: `zalopay:${topupRecord.app_trans_id}`,
            metadata: { app_trans_id: topupRecord.app_trans_id, zp_trans_id: topupRecord.zp_trans_id }
          });
        }
      } else if (zaloPayResult.data.return_code === 2) {
        // Payment failed
        topupRecord.status = 'failed';
        await topupRecord.save();
      }
    }

    res.json({
      success: true,
      data: {
        orderId: topupRecord.orderId,
        app_trans_id: topupRecord.app_trans_id,
        amount: topupRecord.amount,
        status: topupRecord.status,
        payment_time: topupRecord.payment_time,
        created_at: topupRecord.createdAt
      }
    });

  } catch (error) {
    console.error('Query order status error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Không thể truy vấn trạng thái đơn hàng'
    });
  }
}

/**
 * Get user's topup history
 */
export async function getTopupHistory(req, res) {
  try {
    const userId = req.user.sub;
    const { page = 1, limit = 20, status } = req.query;
    
    const skip = (page - 1) * limit;
    let query = { userId };
    
    if (status) {
      query.status = status;
    }

    const topups = await WalletTopup.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-callback_data -ip_address -user_agent');

    const total = await WalletTopup.countDocuments(query);

    res.json({
      success: true,
      data: {
        topups,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get topup history error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Không thể lấy lịch sử nạp tiền'
    });
  }
}
