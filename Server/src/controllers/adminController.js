import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { ghnClient, getGhnHeaders } from "../config/ghn.js";

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
          fromDate = new Date(now.setMonth(now.getMonth() - 3));
          previousFromDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case '1y':
          fromDate = new Date(now.setFullYear(now.getFullYear() - 1));
          previousFromDate = new Date(now.setFullYear(now.getFullYear() - 1));
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
      totalUsers,
      totalActiveProducts, // Tổng số products hiện có
      totalProductsCreated, // Số products được tạo trong khoảng thời gian
      totalOrders,
      totalRevenue,
      totalCommission,
      pendingViolations,

      // Previous period stats for comparison
      previousUsers,
      previousProducts,
      previousOrders,
      previousRevenue,
      previousCommission,

      // Other data
      recentOrders,
      recentUsers,
    ] = await Promise.all([
      // Current period
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ status: 'active' }), // Tổng số products active
      Product.countDocuments({
        status: 'active',
        ...(Object.keys(currentDateFilter).length > 0
          ? { createdAt: currentDateFilter }
          : {}),
      }), // Products được tạo trong khoảng thời gian
      Order.countDocuments({
        status: { $in: ['delivered', 'confirmed'] },
        ...(Object.keys(currentDateFilter).length > 0
          ? { createdAt: currentDateFilter }
          : {}),
      }),
      Order.aggregate([
        {
          $match: {
            status: { $in: ['delivered', 'confirmed'] },
            ...(Object.keys(currentDateFilter).length > 0
              ? { createdAt: currentDateFilter }
              : {}),
          },
        },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } },
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $in: ['delivered', 'confirmed'] },
            ...(Object.keys(currentDateFilter).length > 0
              ? { createdAt: currentDateFilter }
              : {}),
          },
        },
        { $group: { _id: null, total: { $sum: '$commission' } } },
      ]),
      User.countDocuments({
        isActive: true,
        $or: [
          { 'profile.violations': { $exists: true, $ne: [] } },
          { 'profile.suspension': { $exists: true, $ne: null } },
        ],
      }),

      // Previous period for comparison
      Object.keys(previousDateFilter).length > 0
        ? User.countDocuments({
            isActive: true,
            createdAt: previousDateFilter,
          })
        : Promise.resolve(0),
      Object.keys(previousDateFilter).length > 0
        ? Product.countDocuments({
            status: 'active',
            createdAt: previousDateFilter,
          })
        : Promise.resolve(0),
      Object.keys(previousDateFilter).length > 0
        ? Order.countDocuments({
            status: { $in: ['delivered', 'confirmed'] },
            createdAt: previousDateFilter,
          })
        : Promise.resolve(0),
      Object.keys(previousDateFilter).length > 0
        ? Order.aggregate([
            {
              $match: {
                status: { $in: ['delivered', 'confirmed'] },
                createdAt: previousDateFilter,
              },
            },
            { $group: { _id: null, total: { $sum: '$finalAmount' } } },
          ])
        : Promise.resolve([]),
      Object.keys(previousDateFilter).length > 0
        ? Order.aggregate([
            {
              $match: {
                status: { $in: ['delivered', 'confirmed'] },
                createdAt: previousDateFilter,
              },
            },
            { $group: { _id: null, total: { $sum: '$commission' } } },
          ])
        : Promise.resolve([]),

      // Recent data
      Order.find({
        status: { $in: ['delivered', 'confirmed'] },
        ...(Object.keys(currentDateFilter).length > 0
          ? { createdAt: currentDateFilter }
          : {}),
      })
        .populate('buyerId', 'name email')
        .populate('sellerId', 'name email')
        .populate('productId', 'title price')
        .sort({ createdAt: -1 })
        .limit(5),
      User.find({
        isActive: true,
        ...(Object.keys(currentDateFilter).length > 0
          ? { createdAt: currentDateFilter }
          : {}),
      })
        .select('name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
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

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts: totalActiveProducts, // Hiển thị tổng số products active
        totalOrders,
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
              calculatePercentageChange(
                totalProductsCreated,
                previousProducts
              ) * 100
            ) / 100,
          orders:
            Math.round(
              calculatePercentageChange(totalOrders, previousOrders) * 100
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
        User.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$role', count: { $sum: 1 } } },
        ]),
        Product.aggregate([
          { $match: { status: 'active' } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
        ]),
        Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Order.aggregate([
          { $match: { status: { $in: ['delivered', 'confirmed'] } } },
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
          { $limit: 12 },
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
    res.status(500).json({ error: error.message });
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

    // Aggregate orders theo status - sử dụng đúng enum từ Order model
    const statuses = [
      'pending',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
    ];
    const [orders, totalValueResult] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: fromDate, $lte: toDate },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: fromDate, $lte: toDate },
          },
        },
        {
          $group: {
            _id: null,
            totalValue: { $sum: '$finalAmount' },
            totalOrders: { $sum: 1 },
          },
        },
      ]),
    ]);

    // map ra tất cả status, nếu không có status nào vẫn giữ 0
    const result = {};
    statuses.forEach((status) => {
      const found = orders.find((o) => o._id === status);
      result[status] = found ? found.count : 0;
    });

    // tính tổng và tỷ lệ thành công (delivered = thành công)
    const total = Object.values(result).reduce((sum, val) => sum + val, 0);
    const successRate = total > 0 ? (result['delivered'] / total) * 100 : 0;
    const totalValue = totalValueResult[0]?.totalValue || 0;

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
        ],
        values: [
          result['pending'],
          result['confirmed'],
          result['shipped'],
          result['delivered'],
          result['cancelled'],
          result['refunded'],
        ],
        total,
        totalValue: totalValue,
        successRate: successRate.toFixed(1),
        statusBreakdown: {
          pending: result['pending'],
          confirmed: result['confirmed'],
          shipped: result['shipped'],
          delivered: result['delivered'],
          cancelled: result['cancelled'],
          refunded: result['refunded'],
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
        .limit(parseInt(limit)),
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
        .limit(parseInt(limit)),
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
    res.status(500).json({ error: error.message });
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
        .limit(parseInt(limit)),
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
    res.status(500).json({ error: error.message });
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

    if (order.shipping && order.shipping.carrier === 'GHN' && order.shipping.trackingNumber) {
      try {
        const headers = getGhnHeaders();
        const resp = await ghnClient.post('/v2/shipping-order/detail', { order_code: order.shipping.trackingNumber }, { headers });
        const ghnData = resp.data?.data || resp.data;
        // Map GHN status sang status hệ thống
        let ghnStatus = (ghnData.status || ghnData.current_status || '').toLowerCase();
        let mappedStatus = order.status; // fallback
        if (["delivered", "completed", "st_delivered_success"].includes(ghnStatus)) mappedStatus = "delivered";
        else if (["cancelled", "st_cancel"].includes(ghnStatus)) mappedStatus = "cancelled";
        else if (["return_transporting", "returning", "return_sorting"].includes(ghnStatus)) mappedStatus = "refunded";
        else if (["picking", "picked", "st_picked_success", "transporting", "sorting", "delivering"].includes(ghnStatus)) mappedStatus = "shipped";
        else if (["pending", "ready_to_pick", "ready_to_ship"].includes(ghnStatus)) mappedStatus = "pending";

        if (mappedStatus !== order.status) {
          order.status = mappedStatus;
          order.timeline.push({ status: mappedStatus, description: `Tự động đồng bộ trạng thái từ GHN: ${ghnStatus}`, timestamp: new Date() });
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
    const matchQuery = { status: { $in: ['delivered', 'confirmed'] } };

    // Nếu không có startDate/endDate thì lấy mặc định từ đầu năm đến nay
    const now = new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : now;

    // Gộp về đầu tháng và cuối tháng để tính đủ các tháng nằm giữa
    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0);

    matchQuery.createdAt = { $gte: startMonth, $lte: endMonth };

    // Aggregate doanh thu theo tháng
    const monthlyData = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalRevenue: { $sum: '$finalAmount' },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

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
    const revenue = months.map((m) => {
      const found = monthlyData.find(
        (item) => item._id.year === m.year && item._id.month === m.month
      );
      return found ? found.totalRevenue : 0;
    });
    const orders = months.map((m) => {
      const found = monthlyData.find(
        (item) => item._id.year === m.year && item._id.month === m.month
      );
      return found ? found.totalOrders : 0;
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

    // ✅ Tổng hợp summary
    const summaryAgg = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$finalAmount' },
        },
      },
    ]);
    const summary = summaryAgg[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
    };

    res.json({
      success: true,
      data: {
        labels,
        revenue,
        orders,
        growth,
        summary,
      },
    });
  } catch (error) {
    console.error(error);
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
        .limit(parseInt(limit)),
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
    res.status(500).json({ error: error.message });
  }
}
