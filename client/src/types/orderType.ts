export interface Order {
  // Meeting info for deposit orders
  meetingInfo?: {
    location: string;
    time: string;
  };
  _id: string;
  orderNumber: string;

  // User info (populated objects)
  buyerId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  sellerId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };

  // Product info (populated object)
  productId: {
    _id: string;
    title: string;
    price: number;
    images: string[];
  };

  // Order details
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  shippingFee: number;
  commission: number;
  finalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "shipping"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded"
    | "delivered_fail"
    | "deposit_pending"
    | "deposit_confirmed"
    | "deposit_cancelled"
    | "deposit_refunded"
    ;

  // Shipping info
  shipping: {
    method: string;
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: string | null;
    actualDelivery: string | null;
  };

  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    zipCode: string | null;
  };

  // Payment info
  payment: {
    method: "wallet" | "vnpay" | "zalopay" | "cod" | "bank_transfer";
    status: "pending" | "paid" | "refunded" | "failed";
    transactionId: string;
    paidAt: string;
  };

  // Contract info
  contract: {
    contractId: string;
    pdfUrl: string;
    signedAt: string;
    contractNumber: string | null;
  };

  // Timeline
  timeline: Array<{
    status: string;
    description: string;
    updatedBy: string;
    _id: string;
    timestamp: string;
  }>;

  // Additional info
  notes: string | null;
  adminNotes: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  shipping: number;
  delivered: number;
  cancelled: number;
  refunded: number;
  todayOrders: number;
  weeklyOrders: number;
  monthlyRevenue: number;
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  search?: string;
}
