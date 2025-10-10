import { z } from 'zod';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';

// Deposit schema for vehicles - no shipping, just deposit payment
const depositSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),
  seller_id: z.string().min(1, 'Seller ID is required'),
  buyer_name: z.string().min(1, 'Buyer name is required'),
  buyer_phone: z.string().min(6, 'Valid phone number is required'),
  buyer_address: z.string().min(5, 'Valid address is required'),
});

const DEPOSIT_AMOUNT = 500000; // 500k VND deposit for vehicles

/**
 * Create a deposit order for vehicles
 * Vehicle category doesn't use shipping - requires in-person meeting
 * Buyer pays 500k VND deposit, admin confirms transaction, then marks as sold
 */
export async function createVehicleDeposit(req, res) {
  try {
    const validation = depositSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues,
      });
    }

    const { product_id, seller_id, buyer_name, buyer_phone, buyer_address } =
      validation.data;
    const buyerId = req.user?.sub || req.user?.id;

    if (!buyerId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Fetch product and validate it's a vehicle
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.category !== 'vehicle') {
      return res.status(400).json({
        error: 'Deposit payment only applies to vehicle category',
      });
    }

    if (product.status !== 'active') {
      return res.status(400).json({
        error: 'Product is not available for deposit',
      });
    }

    // Verify seller
    if (product.seller.toString() !== seller_id) {
      return res.status(400).json({ error: 'Invalid seller ID' });
    }

    // Check buyer wallet balance
    const buyer = await User.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    const buyerBalance = buyer.wallet?.balance || 0;
    if (buyerBalance < DEPOSIT_AMOUNT) {
      return res.status(400).json({
        error: `Insufficient wallet balance. Required: ${DEPOSIT_AMOUNT} VND, Available: ${buyerBalance} VND`,
      });
    }

    // Deduct deposit from buyer wallet
    const balanceBefore = buyerBalance;
    buyer.wallet = buyer.wallet || {};
    buyer.wallet.balance = balanceBefore - DEPOSIT_AMOUNT;
    buyer.wallet.totalSpent = (buyer.wallet.totalSpent || 0) + DEPOSIT_AMOUNT;
    await buyer.save();

    // Log wallet transaction
    await WalletTransaction.create({
      userId: buyerId,
      type: 'purchase',
      amount: DEPOSIT_AMOUNT,
      balanceBefore,
      balanceAfter: buyer.wallet.balance,
      description: `Đặt cọc xe ${product.title}`,
      status: 'completed',
      reference: `DEPOSIT-${product_id}`,
      metadata: {
        productId: product_id,
        sellerId: seller_id,
        depositAmount: DEPOSIT_AMOUNT,
      },
    });

    // Create order with deposit status
    const orderDoc = await Order.create({
      orderNumber: `DEPOSIT-${Date.now()}`,
      buyerId,
      sellerId: seller_id,
      productId: product_id,
      quantity: 1,
      unitPrice: product.price,
      totalAmount: product.price,
      shippingFee: 0, // No shipping for vehicles
      commission: 0,
      finalAmount: DEPOSIT_AMOUNT, // Only deposit paid at this stage
      status: 'deposit',
      shipping: {
        method: 'in-person',
        trackingNumber: null,
        carrier: null,
      },
      shippingAddress: {
        fullName: buyer_name,
        phone: buyer_phone,
        address: buyer_address,
        city: null,
        province: null,
        zipCode: null,
      },
      payment: {
        method: 'wallet',
        status: 'paid',
        transactionId: `DEPOSIT-${Date.now()}`,
        paidAt: new Date(),
      },
      timeline: [
        {
          status: 'deposit',
          description: `Đã đặt cọc ${DEPOSIT_AMOUNT} VND - Chờ admin xác nhận giao dịch`,
          updatedBy: buyerId,
        },
      ],
      notes: `Vehicle deposit order - In-person meeting required. Deposit: ${DEPOSIT_AMOUNT} VND`,
    });

    // Update product status to indicate deposit received (but not sold yet)
    product.status = 'inactive'; // Temporarily inactive until admin confirms
    await product.save();

    return res.status(201).json({
      success: true,
      message: 'Đặt cọc thành công. Admin sẽ liên hệ để xác nhận giao dịch.',
      data: {
        orderId: orderDoc._id,
        orderNumber: orderDoc.orderNumber,
        depositAmount: DEPOSIT_AMOUNT,
        productTitle: product.title,
        status: 'deposit',
        note: 'Vui lòng chờ admin liên hệ để sắp xếp thời gian gặp mặt và hoàn tất giao dịch.',
      },
    });
  } catch (error) {
    console.error('Error creating vehicle deposit:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

/**
 * Admin confirms deposit transaction and marks product as sold
 * Called after staff verifies both parties completed the transaction
 */
export async function confirmDepositTransaction(req, res) {
  try {
    const { orderId } = req.params;
    const { notes } = req.body;
    const adminId = req.user?.sub || req.user?.id;

    const order = await Order.findById(orderId).populate('productId');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'deposit') {
      return res.status(400).json({
        error: 'Order is not in deposit status',
      });
    }

    // Update order status to delivered (transaction completed)
    order.status = 'delivered';
    order.timeline.push({
      status: 'delivered',
      description:
        notes || 'Admin confirmed successful transaction - Vehicle delivered',
      updatedBy: adminId,
    });
    await order.save();

    // Mark product as sold
    const product = await Product.findById(order.productId);
    if (product) {
      product.status = 'sold';
      await product.save();
    }

    return res.json({
      success: true,
      message: 'Deposit transaction confirmed successfully',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: 'delivered',
        productStatus: 'sold',
      },
    });
  } catch (error) {
    console.error('Error confirming deposit transaction:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

/**
 * Cancel deposit and refund buyer
 * Used if transaction falls through
 */
export async function cancelDeposit(req, res) {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.sub || req.user?.id;

    const order = await Order.findById(orderId).populate('productId');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'deposit') {
      return res.status(400).json({
        error: 'Can only cancel orders in deposit status',
      });
    }

    // Refund buyer
    const buyer = await User.findById(order.buyerId);
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    const refundAmount = order.finalAmount || DEPOSIT_AMOUNT;
    const balanceBefore = buyer.wallet?.balance || 0;
    buyer.wallet = buyer.wallet || {};
    buyer.wallet.balance = balanceBefore + refundAmount;
    await buyer.save();

    // Log refund transaction
    await WalletTransaction.create({
      userId: buyer._id,
      type: 'refund',
      amount: refundAmount,
      balanceBefore,
      balanceAfter: buyer.wallet.balance,
      description: `Hoàn tiền đặt cọc - ${reason || 'Hủy giao dịch'}`,
      status: 'completed',
      reference: order.orderNumber,
      metadata: {
        orderId: order._id,
        reason,
      },
    });

    // Update order status
    order.status = 'cancelled';
    order.timeline.push({
      status: 'cancelled',
      description: `Deposit cancelled and refunded - ${reason || 'Transaction cancelled'}`,
      updatedBy: adminId,
    });
    await order.save();

    // Reactivate product
    const product = await Product.findById(order.productId);
    if (product) {
      product.status = 'active';
      await product.save();
    }

    return res.json({
      success: true,
      message: 'Deposit cancelled and refunded successfully',
      data: {
        orderId: order._id,
        refundAmount,
        newBalance: buyer.wallet.balance,
      },
    });
  } catch (error) {
    console.error('Error cancelling deposit:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

