import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import WalletTransaction from '../models/WalletTransaction.js';
import {
  ghnClient,
  getGhnHeaders,
  mapGhnStatusToSystemStatus,
} from '../config/ghn.js';

export async function getAdminStats(req, res) {
  try {
    const { range, startDate, endDate } = req.query;

    // Xác định khoảng thời gian lọc hiện tại
    let currentDateFilter = {};
    let previousDateFilter = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = end.getTime() - start.getTime();

      currentDateFilter = { $gte: start, $lte: end };
      previousDateFilter = {
        $gte: new Date(start.getTime() - duration),
        $lte: start,
      };
    } else if (range) {
      const now = new Date();
      let fromDate, previousFromDate;

      switch (range) {
        case '7d':
          fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          previousFromDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          previousFromDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
          break;
        case '3m':
          // Fix: Tạo date object mới thay vì mutate now
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          fromDate = threeMonthsAgo;

          const sixMonthsAgo = new Date(now);
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          previousFromDate = sixMonthsAgo;
          break;
        case '1y':
          // Fix: Tạo date object mới thay vì mutate now
          const oneYearAgo = new Date(now);
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          fromDate = oneYearAgo;

          const twoYearsAgo = new Date(now);
          twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
          previousFromDate = twoYearsAgo;
          break;
        default:
          fromDate = null;
          previousFromDate = null;
      }

      if (fromDate) {
        currentDateFilter = { $gte: fromDate, $lte: new Date() };
        previousDateFilter = { $gte: previousFromDate, $lte: fromDate };
      }
    }

    const [
      // Current period stats
      totalUsers, // Số users mới tạo hoặc tổng số users nếu không có filter
      totalProducts, // Số products mới tạo hoặc tổng số products nếu không có filter
      totalOrders,
      totalGHNOrders, // Số đơn GHN (không có orderNumber chứa "DEPOSIT")
      totalRevenue,
      totalCommission,
      pendingViolations,

      // Previous period stats for comparison
      previousUsers,
      previousProducts,
      previousOrders,
      previousGHNOrders, // Số đơn GHN trong previous period
      previousRevenue,
      previousCommission,

      // Other data
      recentOrders,
      recentUsers,
    ] = await Promise.all([
      // Current period - Users
      // Nếu có filter thời gian: đếm users MỚI TẠO trong khoảng thời gian
      // Nếu không có filter: đếm TỔNG SỐ users active hiện tại
      Object.keys(currentDateFilter).length > 0
        ? User.countDocuments({
            isActive: true,
            createdAt: currentDateFilter,
          })
        : User.countDocuments({ isActive: true }),

      // Current period - Products
      // Nếu có filter thời gian: đếm products MỚI TẠO trong khoảng thời gian
      // Nếu không có filter: đếm TỔNG SỐ products active hiện tại
      Object.keys(currentDateFilter).length > 0
        ? Product.countDocuments({
            status: 'active',
            createdAt: currentDateFilter,
          })
        : Product.countDocuments({ status: 'active' }),

      // Orders hoàn thành trong khoảng thời gian - Chỉ đếm delivered (đơn đã hoàn tất)
      Object.keys(currentDateFilter).length > 0
        ? Order.countDocuments({
            orderNumber: { $regex: 'DEPOSIT', $options: 'i' },
            status: 'delivered',
            createdAt: currentDateFilter,
          })
        : Order.countDocuments({
            orderNumber: { $regex: 'DEPOSIT', $options: 'i' },
            status: 'delivered',
          }),

      // Đơn GHN (không có orderNumber chứa "DEPOSIT")
      Object.keys(currentDateFilter).length > 0
        ? Order.countDocuments({
            orderNumber: { $not: { $regex: 'DEPOSIT', $options: 'i' } },
            status: 'delivered',
            createdAt: currentDateFilter,
          })
        : Order.countDocuments({
            orderNumber: { $not: { $regex: 'DEPOSIT', $options: 'i' } },
            status: 'delivered',
          }),

      // Revenue trong khoảng thời gian
      // Doanh thu = Đơn deposit delivered (orderNumber chứa "DEPOSIT" + status delivered) + Subscription purchases
      Promise.all([
        // Revenue từ đơn deposit có orderNumber chứa "DEPOSIT" và status delivered
        Order.aggregate([
          {
            $match: {
              orderNumber: { $regex: 'DEPOSIT', $options: 'i' }, // OrderNumber chứa "DEPOSIT"
              status: 'delivered', // Status delivered (hoàn thành)
              ...(Object.keys(currentDateFilter).length > 0
                ? { createdAt: currentDateFilter }
                : {}),
            },
          },
          { $group: { _id: null, total: { $sum: '$finalAmount' } } },
        ]),
        // Revenue từ subscription purchases
        WalletTransaction.aggregate([
          {
            $match: {
              type: 'purchase',
              reference: { $regex: '^subscription:' }, // Chỉ subscription
              status: 'completed',
              ...(Object.keys(currentDateFilter).length > 0
                ? { createdAt: currentDateFilter }
                : {}),
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]).then(([orderRevenue, subscriptionRevenue]) => {
        const orderTotal = orderRevenue[0]?.total || 0;
        const subscriptionTotal = subscriptionRevenue[0]?.total || 0;
        return [{ total: orderTotal + subscriptionTotal }];
      }),

      // Commission trong khoảng thời gian - KHÔNG tính commission vì không có GHN
      // (Commission chỉ áp dụng cho GHN orders nhưng GHN không tính vào doanh thu)
      Promise.resolve([{ total: 0 }]),

      // Pending violations
      User.countDocuments({
        isActive: true,
        $or: [
          { 'profile.violations': { $exists: true, $ne: [] } },
          { 'profile.suspension': { $exists: true, $ne: null } },
        ],
      }),

      // Previous period - Users mới tạo trong previous period
      Object.keys(previousDateFilter).length > 0
        ? User.countDocuments({
            isActive: true,
            createdAt: previousDateFilter,
          })
        : Promise.resolve(0),

      // Previous period - Products mới tạo trong previous period
      Object.keys(previousDateFilter).length > 0
        ? Product.countDocuments({
            status: 'active',
            createdAt: previousDateFilter,
          })
        : Promise.resolve(0),

      // Previous period - Orders hoàn thành (chỉ delivered, có orderNumber chứa "DEPOSIT")
      Object.keys(previousDateFilter).length > 0
        ? Order.countDocuments({
            orderNumber: { $regex: 'DEPOSIT', $options: 'i' },
            status: 'delivered',
            createdAt: previousDateFilter,
          })
        : Promise.resolve(0),

      // Previous period - Đơn GHN (không có orderNumber chứa "DEPOSIT")
      Object.keys(previousDateFilter).length > 0
        ? Order.countDocuments({
            orderNumber: { $not: { $regex: 'DEPOSIT', $options: 'i' } },
            status: 'delivered',
            createdAt: previousDateFilter,
          })
        : Promise.resolve(0),

      // Previous period - Revenue (orders + subscriptions)
      Object.keys(previousDateFilter).length > 0
        ? Promise.all([
            Order.aggregate([
              {
                $match: {
                  orderNumber: { $regex: 'DEPOSIT', $options: 'i' },
                  status: 'delivered',
                  createdAt: previousDateFilter,
                },
              },
              { $group: { _id: null, total: { $sum: '$finalAmount' } } },
            ]),
            WalletTransaction.aggregate([
              {
                $match: {
                  type: 'purchase',
                  reference: { $regex: '^subscription:' },
                  status: 'completed',
                  createdAt: previousDateFilter,
                },
              },
              { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
          ]).then(([orderRevenue, subscriptionRevenue]) => {
            const orderTotal = orderRevenue[0]?.total || 0;
            const subscriptionTotal = subscriptionRevenue[0]?.total || 0;
            return [{ total: orderTotal + subscriptionTotal }];
          })
        : Promise.resolve([]),

      // Previous period - Commission (không có)
      Promise.resolve([{ total: 0 }]),

      // Recent orders (lấy TẤT CẢ orders bao gồm cả GHN)
      Order.find({
        ...(Object.keys(currentDateFilter).length > 0
          ? { createdAt: currentDateFilter }
          : {}),
      })
        .populate('buyerId', 'name email')
        .populate('sellerId', 'name email')
        .populate('productId', 'title price')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(), // Thêm lean() để tối ưu performance

      // Recent users (chỉ lấy trong current period nếu có filter)
      User.find({
        isActive: true,
        ...(Object.keys(currentDateFilter).length > 0
          ? { createdAt: currentDateFilter }
          : {}),
      })
        .select('name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(), // Thêm lean() để tối ưu performance
    ]);

    // Calculate percentage changes
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const currentRevenueValue = totalRevenue[0]?.total || 0;
    const currentCommissionValue = totalCommission[0]?.total || 0;
    const previousRevenueValue = previousRevenue[0]?.total || 0;
    const previousCommissionValue = previousCommission[0]?.total || 0;

    // Tính tổng số đơn (DEPOSIT + GHN) để so sánh phần trăm
    const totalAllOrders = totalOrders + totalGHNOrders;
    const previousAllOrders = previousOrders + previousGHNOrders;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts, // Hiển thị số products (mới tạo hoặc tổng số)
        totalOrders,
        totalGHNOrders, // Số đơn GHN (không có DEPOSIT)
        totalRevenue: currentRevenueValue,
        totalCommission: currentCommissionValue,
        pendingViolations,

        // Percentage changes
        percentageChanges: {
          users:
            Math.round(
              calculatePercentageChange(totalUsers, previousUsers) * 100
            ) / 100,
          products:
            Math.round(
              calculatePercentageChange(totalProducts, previousProducts) * 100
            ) / 100,
          orders:
            Math.round(
              calculatePercentageChange(totalAllOrders, previousAllOrders) * 100
            ) / 100,
          revenue:
            Math.round(
              calculatePercentageChange(
                currentRevenueValue,
                previousRevenueValue
              ) * 100
            ) / 100,
          commission:
            Math.round(
              calculatePercentageChange(
                currentCommissionValue,
                previousCommissionValue
              ) * 100
            ) / 100,
        },

        recentOrders,
        recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getSystemStats(req, res) {
  try {
    const [usersByRole, productsByCategory, ordersByStatus, revenueByMonth] =
      await Promise.all([
        // Users by role
        User.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$role', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        // Products by category
        Product.aggregate([
          { $match: { status: 'active' } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        // Orders by status
        Order.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        // Revenue by month (12 tháng gần nhất) — chỉ tính từ đơn deposit delivered (orderNumber chứa "DEPOSIT")
        Order.aggregate([
          {
            $match: {
              orderNumber: { $regex: 'DEPOSIT', $options: 'i' },
              status: 'delivered',
              createdAt: {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
              },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              revenue: { $sum: '$finalAmount' },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
      ]);

    res.json({
      success: true,
      data: {
        usersByRole,
        productsByCategory,
        ordersByStatus,
        revenueByMonth,
      },
    });
  } catch (error) {
    console.error('getSystemStats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getOrdersSummary(req, res) {
  try {
    const { range, startDate, endDate } = req.query;

    const now = new Date();
    let fromDate;
    let toDate = endDate ? new Date(endDate) : now;

    // Xác định fromDate dựa trên range hoặc startDate
    if (startDate) {
      fromDate = new Date(startDate);
    } else if (range) {
      switch (range) {
        case '7d':
          fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          fromDate = new Date(
            now.getFullYear() - 1,
            now.getMonth(),
            now.getDate()
          );
          break;
        default:
          fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    } else {
      // Mặc định 30 ngày
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const aggregateResults = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: fromDate, $lte: toDate },
        },
      },
      {
        $facet: {
          // Group theo status
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ],
          // Tính tổng value từ đơn deposit delivered (orderNumber chứa "DEPOSIT")
          orderRevenue: [
            {
              $match: {
                orderNumber: { $regex: 'DEPOSIT', $options: 'i' },
                status: 'delivered',
              },
            },
            {
              $group: {
                _id: null,
                totalValue: { $sum: '$finalAmount' },
                totalOrders: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    // Lấy subscription revenue
    const subscriptionRevenue = await WalletTransaction.aggregate([
      {
        $match: {
          type: 'purchase',
          reference: { $regex: '^subscription:' },
          status: 'completed',
          createdAt: { $gte: fromDate, $lte: toDate },
        },
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$amount' },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    const orders = aggregateResults[0]?.byStatus || [];
    const orderRevenueResult = aggregateResults[0]?.orderRevenue || [];
    const subscriptionRevenueResult = subscriptionRevenue[0] || {
      totalValue: 0,
      totalCount: 0,
    };

    // Tính tổng revenue từ cả orders và subscriptions
    const orderRevenueValue = orderRevenueResult[0]?.totalValue || 0;
    const subscriptionRevenueValue = subscriptionRevenueResult.totalValue || 0;
    const totalValue = orderRevenueValue + subscriptionRevenueValue;

    // Định nghĩa tất cả status có thể có
    const statuses = [
      'pending',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
      'deposit', // Thêm deposit status
    ];

    // Map ra tất cả status, nếu không có status nào vẫn giữ 0
    const result = {};
    statuses.forEach((status) => {
      const found = orders.find((o) => o._id === status);
      result[status] = found ? found.count : 0;
    });

    // Tính tổng và tỷ lệ thành công
    // Thành công = confirmed (deposit đã xác nhận) + delivered (GHN đã giao) + deposit (chờ xác nhận)
    const total = Object.values(result).reduce((sum, val) => sum + val, 0);
    const successfulOrders =
      result['confirmed'] + result['delivered'] + result['deposit'];
    const successRate = total > 0 ? (successfulOrders / total) * 100 : 0;

    res.json({
      success: true,
      data: {
        categories: [
          'Chờ xử lý',
          'Đã xác nhận',
          'Đang vận chuyển',
          'Đã giao',
          'Đã hủy',
          'Đã hoàn tiền',
          'Đặt cọc', // Thêm category cho deposit
        ],
        values: [
          result['pending'],
          result['confirmed'],
          result['shipped'],
          result['delivered'],
          result['cancelled'],
          result['refunded'],
          result['deposit'], // Thêm value cho deposit
        ],
        total,
        totalValue,
        successRate: parseFloat(successRate.toFixed(1)),
        statusBreakdown: {
          pending: result['pending'],
          confirmed: result['confirmed'],
          shipped: result['shipped'],
          delivered: result['delivered'],
          cancelled: result['cancelled'],
          refunded: result['refunded'],
          deposit: result['deposit'], // Thêm deposit vào breakdown
        },
      },
    });
  } catch (error) {
    console.error('getOrdersSummary error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAllUsers(req, res) {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true, role: 'user' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -wallet')
        .sort({ createdAt: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .lean(), // Thêm lean() cho performance
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh sách người dùng',
      error: error.message,
    });
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password -wallet');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Admin chỉ có thể update một số field nhất định (ban/unban, role)
    const allowedFields = ['isActive', 'role'];
    const filteredData = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    // Prevent updating password, profile, wallet through this endpoint
    delete updateData.password;
    delete updateData.profile;
    delete updateData.wallet;

    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({
        error:
          'Admin chỉ có thể cập nhật isActive (ban/unban) và role. User phải tự update profile qua /api/profile',
      });
    }

    const user = await User.findByIdAndUpdate(id, filteredData, {
      new: true,
      runValidators: true,
    }).select('-password -wallet');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message:
        'User status updated successfully (Admin chỉ có thể ban/unban user)',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // Admin không xóa user hoàn toàn, chỉ ban user (set isActive = false)
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password -wallet');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User banned successfully (Admin không xóa user, chỉ ban user)',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAllProducts(req, res) {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (status === 'active') {
      query.status = 'active';
    } else if (status === 'inactive') {
      query.status = 'inactive';
    } else if (status === 'pending') {
      query.status = 'pending';
    } else if (status === 'sold') {
      query.status = 'sold';
    } else if (status === 'rejected') {
      query.status = 'rejected';
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('seller', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(), // Thêm lean() cho performance
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('getAllProducts error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate(
      'seller',
      'name email phone'
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('seller', 'name email');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { status: 'inactive' },
      { new: true }
    ).populate('seller', 'name email');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deactivated successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAllOrders(req, res) {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (status) {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('buyerId', 'name email phone')
        .populate('sellerId', 'name email phone')
        .populate('productId', 'title price images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(), // Thêm lean() cho performance
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('getAllOrders error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    let order = await Order.findById(id)
      .populate('buyerId', 'name email phone')
      .populate('sellerId', 'name email phone')
      .populate('productId', 'title price images description');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (
      order.shipping &&
      order.shipping.carrier === 'GHN' &&
      order.shipping.trackingNumber
    ) {
      try {
        const headers = getGhnHeaders();
        const resp = await ghnClient.post(
          '/v2/shipping-order/detail',
          { order_code: order.shipping.trackingNumber },
          { headers }
        );
        const ghnData = resp.data?.data || resp.data;
        const ghnStatus = ghnData.status || ghnData.current_status || '';
        const mappedStatus = mapGhnStatusToSystemStatus(ghnStatus);

        if (mappedStatus && mappedStatus !== order.status) {
          order.status = mappedStatus;
          if (mappedStatus === 'delivered' && !order.shipping.actualDelivery) {
            order.shipping.actualDelivery = new Date();
          }
          order.timeline.push({
            status: mappedStatus,
            description: `Tự động đồng bộ trạng thái từ GHN: ${ghnStatus}`,
            timestamp: new Date(),
            updatedBy: req.user?.sub,
          });
          await order.save();
        }
      } catch (e) {
        console.warn('GHN sync status failed:', e?.message);
      }
      order = await Order.findById(id)
        .populate('buyerId', 'name email phone')
        .populate('sellerId', 'name email phone')
        .populate('productId', 'title price images description');
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    if (notes) {
      order.notes = notes;
    }

    order.timeline.push({
      status,
      description: notes || `Status changed to ${status} by admin`,
      updatedBy: req.user.sub,
      timestamp: new Date(),
    });

    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate('buyerId', 'name email phone')
      .populate('sellerId', 'name email phone')
      .populate('productId', 'title price images');

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Quản lý vi phạm người dùng
export async function reportViolation(req, res) {
  try {
    const { userId } = req.params;
    const { violationType, description, severity, action } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Khởi tạo violations array nếu chưa có
    if (!user.profile.violations) {
      user.profile.violations = [];
    }

    const violation = {
      type: violationType,
      description,
      severity, // low, medium, high
      action, // warning, suspension, ban
      reportedBy: req.user.sub,
      reportedAt: new Date(),
      status: 'pending',
    };

    user.profile.violations.push(violation);

    // Xử lý hành động ngay lập tức nếu cần
    if (action === 'suspension') {
      user.profile.suspension = {
        reason: description,
        suspendedAt: new Date(),
        suspendedBy: req.user.sub,
      };
    } else if (action === 'ban') {
      user.isActive = false;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Violation reported successfully',
      data: { violation, action },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Xem danh sách vi phạm
export async function getViolations(req, res) {
  try {
    const { page = 1, limit = 20, status = '', severity = '' } = req.query;
    const skip = (page - 1) * limit;

    let matchQuery = {
      isActive: true,
      'profile.violations': { $exists: true, $ne: [] },
    };

    if (status) {
      matchQuery[`profile.violations.status`] = status;
    }

    if (severity) {
      matchQuery[`profile.violations.severity`] = severity;
    }

    const users = await User.find(matchQuery)
      .select('name email profile.violations profile.suspension')
      .sort({ 'profile.violations.reportedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(matchQuery);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Xử lý vi phạm
export async function handleViolation(req, res) {
  try {
    const { userId, violationId } = req.params;
    const { action, adminNotes } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.profile.violations) {
      return res.status(404).json({ error: 'User or violation not found' });
    }

    const violation = user.profile.violations.id(violationId);
    if (!violation) {
      return res.status(404).json({ error: 'Violation not found' });
    }

    violation.status = 'resolved';
    violation.resolvedBy = req.user.sub;
    violation.resolvedAt = new Date();
    violation.adminNotes = adminNotes;

    // Xử lý hành động
    if (action === 'suspension') {
      user.profile.suspension = {
        reason: violation.description,
        suspendedAt: new Date(),
        suspendedBy: req.user.sub,
      };
    } else if (action === 'ban') {
      user.isActive = false;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Violation handled successfully',
      data: { violation, action },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Báo cáo doanh thu platform
export async function getPlatformRevenue(req, res) {
  try {
    const { startDate, endDate } = req.query;

    // Nếu không có startDate/endDate thì lấy mặc định từ đầu năm đến nay
    const now = new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : now;

    // Gộp về đầu tháng và cuối tháng để tính đủ các tháng nằm giữa
    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0);

    const dateFilter = { $gte: startMonth, $lte: endMonth };

    // Aggregate doanh thu theo tháng từ orders và subscriptions
    const [orderMonthlyData, subscriptionMonthlyData] = await Promise.all([
      // Revenue từ đơn deposit delivered (orderNumber chứa "DEPOSIT")
      // Sử dụng updatedAt để lấy đơn theo thời điểm delivered (không phải createdAt)
      Order.aggregate([
        {
          $match: {
            orderNumber: { $regex: 'DEPOSIT', $options: 'i' },
            status: 'delivered',
            updatedAt: dateFilter, // Đổi từ createdAt sang updatedAt
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$updatedAt' }, // Đổi từ createdAt sang updatedAt
              month: { $month: '$updatedAt' },
            },
            totalRevenue: { $sum: '$finalAmount' },
            totalOrders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      // Revenue từ subscriptions
      WalletTransaction.aggregate([
        {
          $match: {
            type: 'purchase',
            reference: { $regex: '^subscription:' },
            status: 'completed',
            createdAt: dateFilter,
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            totalRevenue: { $sum: '$amount' },
            totalOrders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    // Merge data từ orders và subscriptions
    const monthlyDataMap = new Map();

    orderMonthlyData.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      monthlyDataMap.set(key, {
        _id: item._id,
        totalRevenue: item.totalRevenue,
        totalOrders: item.totalOrders,
      });
    });

    subscriptionMonthlyData.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      if (monthlyDataMap.has(key)) {
        const existing = monthlyDataMap.get(key);
        existing.totalRevenue += item.totalRevenue;
        existing.totalOrders += item.totalOrders;
      } else {
        monthlyDataMap.set(key, {
          _id: item._id,
          totalRevenue: item.totalRevenue,
          totalOrders: item.totalOrders,
        });
      }
    });

    const monthlyData = Array.from(monthlyDataMap.values()).sort((a, b) => {
      if (a._id.year !== b._id.year) return a._id.year - b._id.year;
      return a._id.month - b._id.month;
    });

    // ✅ Tạo danh sách các tháng giữa start và end (đảm bảo đủ tháng)
    const months = [];
    const cursor = new Date(startMonth);
    while (
      cursor.getFullYear() < endMonth.getFullYear() ||
      (cursor.getFullYear() === endMonth.getFullYear() &&
        cursor.getMonth() <= endMonth.getMonth())
    ) {
      months.push({
        year: cursor.getFullYear(),
        month: cursor.getMonth() + 1,
        label: `Tháng ${cursor.getMonth() + 1}/${cursor.getFullYear()}`,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    // ✅ Map dữ liệu thực vào danh sách tháng
    const labels = months.map((m) => m.label);

    // Tổng doanh thu (orders + subscriptions) theo tháng
    const revenue = months.map((m) => {
      const found = monthlyData.find(
        (item) => item._id.year === m.year && item._id.month === m.month
      );
      return found ? found.totalRevenue : 0;
    });

    // Số giao dịch orders theo tháng (CHỈ từ orderMonthlyData)
    const orders = months.map((m) => {
      const found = orderMonthlyData.find(
        (item) => item._id.year === m.year && item._id.month === m.month
      );
      return found ? found.totalOrders : 0;
    });

    // Số giao dịch subscriptions theo tháng
    const subscriptions = months.map((m) => {
      const found = subscriptionMonthlyData.find(
        (item) => item._id.year === m.year && item._id.month === m.month
      );
      return found ? found.totalOrders : 0;
    });

    // Doanh thu từ orders theo tháng
    const orderRevenue = months.map((m) => {
      const found = orderMonthlyData.find(
        (item) => item._id.year === m.year && item._id.month === m.month
      );
      return found ? found.totalRevenue : 0;
    });

    // Doanh thu từ subscriptions theo tháng
    const subscriptionRevenue = months.map((m) => {
      const found = subscriptionMonthlyData.find(
        (item) => item._id.year === m.year && item._id.month === m.month
      );
      return found ? found.totalRevenue : 0;
    });

    // ✅ Tính % tăng trưởng (tháng gần nhất vs tháng trước)
    let growth = '+0%';
    if (revenue.length > 1) {
      const last = revenue[revenue.length - 1];
      const prev = revenue[revenue.length - 2];
      growth =
        prev && prev !== 0
          ? `${(((last - prev) / prev) * 100).toFixed(1)}%`
          : '+0%';
    }

    // ✅ Tổng hợp summary từ orders và subscriptions
    const [orderSummary, subscriptionSummary] = await Promise.all([
      // Tổng hợp từ đơn DEPOSIT delivered (CHỈ đơn cọc xe, KHÔNG bao gồm đơn GHN)
      Order.aggregate([
        {
          $match: {
            orderNumber: { $regex: 'DEPOSIT', $options: 'i' }, // CHỈ đơn DEPOSIT
            status: 'delivered', // CHỈ đơn đã giao
            updatedAt: dateFilter, // Đổi từ createdAt sang updatedAt
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$finalAmount' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$finalAmount' },
          },
        },
      ]),
      WalletTransaction.aggregate([
        {
          $match: {
            type: 'purchase',
            reference: { $regex: '^subscription:' },
            status: 'completed',
            createdAt: dateFilter,
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$amount' },
          },
        },
      ]),
    ]);

    const orderSum = orderSummary[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
    };
    const subscriptionSum = subscriptionSummary[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
    };

    const summary = {
      totalRevenue: orderSum.totalRevenue + subscriptionSum.totalRevenue,
      totalOrders: orderSum.totalOrders, // Chỉ đơn deposit delivered
      totalSubscriptions: subscriptionSum.totalOrders, // Số gói đăng ký
      totalTransactions: orderSum.totalOrders + subscriptionSum.totalOrders, // Tổng giao dịch
      avgOrderValue: orderSum.avgOrderValue || 0, // Giá trị TB đơn hàng
      avgSubscriptionValue: subscriptionSum.avgOrderValue || 0, // Giá trị TB subscription
      avgTransactionValue:
        orderSum.totalOrders + subscriptionSum.totalOrders > 0
          ? (orderSum.totalRevenue + subscriptionSum.totalRevenue) /
            (orderSum.totalOrders + subscriptionSum.totalOrders)
          : 0,
    };

    res.json({
      success: true,
      data: {
        labels,
        revenue, // Tổng doanh thu (orders + subscriptions) theo tháng
        orders, // Số giao dịch ORDERS theo tháng (CHỈ xe)
        subscriptions, // Số giao dịch SUBSCRIPTIONS theo tháng (CHỈ gói)
        orderRevenue, // Doanh thu từ orders theo tháng
        subscriptionRevenue, // Doanh thu từ subscriptions theo tháng
        growth,
        summary,
      },
    });
  } catch (error) {
    console.error('getPlatformRevenue error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Admin xét duyệt sản phẩm
export async function approveProduct(req, res) {
  try {
    const { id } = req.params;
    const adminId = req.user.sub || req.user.id;

    // Tìm sản phẩm
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }

    // Kiểm tra sản phẩm đang ở trạng thái pending
    if (product.status !== 'pending') {
      return res.status(400).json({
        error: 'Sản phẩm này không cần xét duyệt',
      });
    }

    // Cập nhật status thành active
    await Product.findByIdAndUpdate(id, {
      status: 'active',
      approvedBy: adminId,
      approvedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Đã duyệt sản phẩm thành công',
      data: {
        productId: id,
        status: 'active',
        approvedBy: adminId,
        approvedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Admin từ chối sản phẩm
export async function rejectProduct(req, res) {
  try {
    const { id } = req.params;
    const adminId = req.user.sub || req.user.id;
    const { reason } = req.body;

    // Tìm sản phẩm
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }

    // Kiểm tra sản phẩm đang ở trạng thái pending
    if (product.status !== 'pending') {
      return res.status(400).json({
        error: 'Sản phẩm này không cần xét duyệt',
      });
    }

    // Cập nhật status thành rejected
    await Product.findByIdAndUpdate(id, {
      status: 'rejected',
      rejectedBy: adminId,
      rejectedAt: new Date(),
      rejectionReason: reason || 'Không đáp ứng tiêu chuẩn chất lượng',
    });

    res.json({
      success: true,
      message: 'Đã từ chối sản phẩm',
      data: {
        productId: id,
        status: 'rejected',
        rejectedBy: adminId,
        rejectedAt: new Date(),
        reason: reason || 'Không đáp ứng tiêu chuẩn chất lượng',
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Admin xem danh sách sản phẩm chờ duyệt
export async function getPendingProducts(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ status: 'pending' })
        .populate('seller', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(), // Thêm lean() cho performance
      Product.countDocuments({ status: 'pending' }),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('getPendingProducts error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// Admin: Sync GHN status for a specific order
export async function syncGhnOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (
      !order.shipping ||
      order.shipping.carrier !== 'GHN' ||
      !order.shipping.trackingNumber
    ) {
      return res.status(400).json({
        success: false,
        error: 'Order is not using GHN shipping or missing tracking number',
      });
    }

    try {
      // Use shop ID from order if available, otherwise fallback to env
      const shopId = order.shipping?.ghnShopId || process.env.GHN_SHOP_ID;
      const headers = getGhnHeaders(shopId);
      const trackingNumber = order.shipping.trackingNumber.trim();

      const resp = await ghnClient.post(
        '/v2/shipping-order/detail',
        { order_code: trackingNumber },
        { headers }
      );

      const ghnData = resp.data?.data || resp.data;
      const ghnStatus = ghnData?.status || ghnData?.current_status || '';

      if (!ghnStatus) {
        console.warn(
          `[Admin GHN Sync] No status found in GHN response for tracking: ${trackingNumber}`
        );
      }

      const mappedStatus = mapGhnStatusToSystemStatus(ghnStatus);

      const oldStatus = order.status;
      let updated = false;

      if (!mappedStatus) {
        console.warn(
          `[Admin GHN Sync] Cannot map GHN status "${ghnStatus}" to system status for order ${order.orderNumber}`
        );
      }

      if (mappedStatus && mappedStatus !== order.status) {
        try {
          // Use findByIdAndUpdate for more reliable status update
          // This bypasses pre-save hooks validation that might block status updates
          const savedOrder = await Order.findByIdAndUpdate(
            order._id,
            {
              status: mappedStatus,
              $push: {
                timeline: {
                  status: mappedStatus,
                  description: `Admin đồng bộ trạng thái từ GHN: ${ghnStatus}`,
                  timestamp: new Date(),
                  updatedBy: req.user?.sub || req.user?.id,
                },
              },
              ...(mappedStatus === 'delivered' && !order.shipping.actualDelivery
                ? {
                    'shipping.actualDelivery': new Date(),
                  }
                : {}),
            },
            {
              new: true,
              runValidators: true,
              setDefaultsOnInsert: false,
            }
          );

          if (!savedOrder) {
            throw new Error('Failed to update order: order not found');
          }

          // Update local order object to match saved order
          Object.assign(order, savedOrder.toObject());
          updated = true;
        } catch (saveError) {
          console.error(
            `[Admin GHN Sync] Error saving order ${order.orderNumber}:`,
            saveError.message
          );
          // Continue even if save fails - will return error in response
        }
      }

      // Reload order to get latest status from database
      await order.populate('buyerId sellerId productId');
      const refreshedOrder = await Order.findById(order._id);

      res.json({
        success: true,
        message: updated ? 'Status updated successfully' : 'Status unchanged',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          trackingNumber: order.shipping.trackingNumber,
          oldStatus,
          newStatus: refreshedOrder?.status || mappedStatus || order.status,
          ghnStatus,
          mappedStatus,
          currentStatus: order.status,
          ghnData,
          updated,
        },
      });
    } catch (ghnError) {
      console.error('[Admin GHN Sync] Error:', ghnError);

      // Extract detailed error info
      const errorDetails = {
        message: ghnError.message,
        status: ghnError.response?.status,
        statusText: ghnError.response?.statusText,
        ghnResponse: ghnError.response?.data,
        code: ghnError.code,
        trackingNumber: order.shipping.trackingNumber,
      };

      // More specific error messages
      let errorMessage = 'Không thể kết nối với GHN API';

      if (ghnError.code === 'ECONNREFUSED') {
        errorMessage =
          'GHN API từ chối kết nối. Kiểm tra GHN_BASE_URL và network.';
      } else if (
        ghnError.code === 'ETIMEDOUT' ||
        ghnError.code === 'ECONNABORTED'
      ) {
        errorMessage = 'GHN API timeout (quá 15 giây). Vui lòng thử lại sau.';
      } else if (
        ghnError.code === 'ENOTFOUND' ||
        ghnError.code === 'EAI_AGAIN'
      ) {
        errorMessage =
          'Không thể tìm thấy GHN API server. Kiểm tra GHN_BASE_URL.';
      } else if (
        ghnError.response?.status === 401 ||
        ghnError.response?.status === 403
      ) {
        errorMessage =
          'Lỗi xác thực GHN. Vui lòng kiểm tra GHN_TOKEN và GHN_SHOP_ID.';
      } else if (ghnError.response?.status === 404) {
        errorMessage = `Không tìm thấy đơn hàng với tracking number: ${order.shipping.trackingNumber}`;
      } else if (
        ghnError.response?.status === 500 ||
        ghnError.response?.status === 502 ||
        ghnError.response?.status === 503
      ) {
        errorMessage = `GHN API server error (${ghnError.response.status}). GHN có thể đang bảo trì.`;
      } else if (ghnError.response?.data?.message) {
        errorMessage = `GHN API: ${ghnError.response.data.message}`;
      } else if (ghnError.response?.data?.code_message) {
        errorMessage = `GHN API: ${ghnError.response.data.code_message}`;
      } else if (ghnError.message) {
        errorMessage = ghnError.message;
      }

      return res.status(502).json({
        success: false,
        error: 'Failed to fetch GHN status',
        message: errorMessage,
        details: errorDetails,
      });
    }
  } catch (error) {
    console.error('[Admin GHN Sync] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Admin: Sync GHN status for multiple orders
export async function syncGhnOrdersBulk(req, res) {
  try {
    const { orderIds, limit = 50 } = req.body;

    let query = {
      'shipping.carrier': 'GHN',
      'shipping.trackingNumber': { $exists: true, $ne: null },
    };

    // If specific order IDs provided, filter by them
    if (orderIds && Array.isArray(orderIds) && orderIds.length > 0) {
      query._id = { $in: orderIds };
    }

    const orders = await Order.find(query).limit(parseInt(limit));

    if (orders.length === 0) {
      return res.json({
        success: true,
        message: 'No GHN orders found to sync',
        results: [],
      });
    }

    const headers = getGhnHeaders();
    const results = [];

    for (const order of orders) {
      try {
        const resp = await ghnClient.post(
          '/v2/shipping-order/detail',
          { order_code: order.shipping.trackingNumber },
          { headers }
        );
        const ghnData = resp.data?.data || resp.data;
        const ghnStatus = ghnData.status || ghnData.current_status || '';
        const mappedStatus = mapGhnStatusToSystemStatus(ghnStatus);

        const oldStatus = order.status;
        let updated = false;

        if (mappedStatus && mappedStatus !== order.status) {
          order.status = mappedStatus;
          if (mappedStatus === 'delivered' && !order.shipping.actualDelivery) {
            order.shipping.actualDelivery = new Date();
          }
          order.timeline.push({
            status: mappedStatus,
            description: `Admin đồng bộ hàng loạt từ GHN: ${ghnStatus}`,
            timestamp: new Date(),
            updatedBy: req.user?.sub || req.user?.id,
          });
          await order.save();
          updated = true;
        }

        results.push({
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          trackingNumber: order.shipping.trackingNumber,
          oldStatus,
          newStatus: mappedStatus || order.status,
          ghnStatus,
          updated,
          success: true,
        });
      } catch (err) {
        results.push({
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          trackingNumber: order.shipping.trackingNumber,
          error: err.message,
          success: false,
        });
      }
    }

    const updatedCount = results.filter((r) => r.updated).length;
    res.json({
      success: true,
      message: `Synced ${orders.length} orders, ${updatedCount} updated`,
      total: orders.length,
      updated: updatedCount,
      results,
    });
  } catch (error) {
    console.error('[Admin GHN Bulk Sync] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
