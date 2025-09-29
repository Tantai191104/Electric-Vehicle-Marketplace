import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import WalletTransaction from "../models/WalletTransaction.js";

export async function getAdminStats(req, res) {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      recentOrders,
      recentUsers,
      totalRevenue,
      totalCommission,
      pendingViolations
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.find()
        .populate('buyerId', 'name email')
        .populate('sellerId', 'name email')
        .populate('productId', 'title price')
        .sort({ createdAt: -1 })
        .limit(5),
      User.find({ isActive: true })
        .select('name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
      // Tổng doanh thu từ tất cả giao dịch
      Order.aggregate([
        { $match: { status: { $in: ['delivered', 'confirmed'] } } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]),
      // Tổng commission platform thu được
      Order.aggregate([
        { $match: { status: { $in: ['delivered', 'confirmed'] } } },
        { $group: { _id: null, total: { $sum: '$commission' } } }
      ]),
      // Số lượng vi phạm đang chờ xử lý
      User.countDocuments({ 
        isActive: true, 
        $or: [
          { 'profile.violations': { $exists: true, $ne: [] } },
          { 'profile.suspension': { $exists: true, $ne: null } }
        ]
      })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCommission: totalCommission[0]?.total || 0,
        pendingViolations,
        recentOrders,
        recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getSystemStats(req, res) {
  try {
    const [
      usersByRole,
      productsByCategory,
      ordersByStatus,
      revenueByMonth
    ] = await Promise.all([
      User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { status: { $in: ['delivered', 'confirmed'] } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$finalAmount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        usersByRole,
        productsByCategory,
        ordersByStatus,
        revenueByMonth
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAllUsers(req, res) {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    
    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -wallet') 
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      data: user
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
        error: 'Admin chỉ có thể cập nhật isActive (ban/unban) và role. User phải tự update profile qua /api/profile' 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      filteredData,
      { new: true, runValidators: true }
    ).select('-password -wallet');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User status updated successfully (Admin chỉ có thể ban/unban user)',
      data: user
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
      data: user
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
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('sellerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate('sellerId', 'name email phone');
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('sellerId', 'name email');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      data: product
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
      { isActive: false },
      { new: true }
    ).populate('sellerId', 'name email');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deactivated successfully',
      data: product
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
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('buyerId', 'name email phone')
      .populate('sellerId', 'name email phone')
      .populate('productId', 'title price images description');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      data: order
    });
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
      timestamp: new Date()
    });

    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate('buyerId', 'name email phone')
      .populate('sellerId', 'name email phone')
      .populate('productId', 'title price images');

    res.json({
      success: true,
      data: updatedOrder
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
      status: 'pending'
    };

    user.profile.violations.push(violation);

    // Xử lý hành động ngay lập tức nếu cần
    if (action === 'suspension') {
      user.profile.suspension = {
        reason: description,
        suspendedAt: new Date(),
        suspendedBy: req.user.sub
      };
    } else if (action === 'ban') {
      user.isActive = false;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Violation reported successfully',
      data: { violation, action }
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
      'profile.violations': { $exists: true, $ne: [] }
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
        pages: Math.ceil(total / limit)
      }
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
        suspendedBy: req.user.sub
      };
    } else if (action === 'ban') {
      user.isActive = false;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Violation handled successfully',
      data: { violation, action }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Báo cáo doanh thu platform
export async function getPlatformRevenue(req, res) {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    let matchQuery = {
      status: { $in: ['delivered', 'confirmed'] }
    };

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const revenueData = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: groupBy === 'month' ? { $month: '$createdAt' } : null,
            day: groupBy === 'day' ? { $dayOfMonth: '$createdAt' } : null
          },
          totalRevenue: { $sum: '$finalAmount' },
          totalCommission: { $sum: '$commission' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$finalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const summary = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' },
          totalCommission: { $sum: '$commission' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$finalAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: summary[0] || {
          totalRevenue: 0,
          totalCommission: 0,
          totalOrders: 0,
          avgOrderValue: 0
        },
        timeline: revenueData
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      return res.status(404).json({ error: "Sản phẩm không tồn tại" });
    }

    // Kiểm tra sản phẩm đang ở trạng thái pending
    if (product.status !== "pending") {
      return res.status(400).json({ 
        error: "Sản phẩm này không cần xét duyệt" 
      });
    }

    // Cập nhật status thành active
    await Product.findByIdAndUpdate(id, { 
      status: "active",
      approvedBy: adminId,
      approvedAt: new Date()
    });

    res.json({
      success: true,
      message: "Đã duyệt sản phẩm thành công",
      data: {
        productId: id,
        status: "active",
        approvedBy: adminId,
        approvedAt: new Date()
      }
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
      return res.status(404).json({ error: "Sản phẩm không tồn tại" });
    }

    // Kiểm tra sản phẩm đang ở trạng thái pending
    if (product.status !== "pending") {
      return res.status(400).json({ 
        error: "Sản phẩm này không cần xét duyệt" 
      });
    }

    // Cập nhật status thành rejected
    await Product.findByIdAndUpdate(id, { 
      status: "rejected",
      rejectedBy: adminId,
      rejectedAt: new Date(),
      rejectionReason: reason || "Không đáp ứng tiêu chuẩn chất lượng"
    });

    res.json({
      success: true,
      message: "Đã từ chối sản phẩm",
      data: {
        productId: id,
        status: "rejected",
        rejectedBy: adminId,
        rejectedAt: new Date(),
        reason: reason || "Không đáp ứng tiêu chuẩn chất lượng"
      }
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
      Product.find({ status: "pending" })
        .populate("seller", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments({ status: "pending" })
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
