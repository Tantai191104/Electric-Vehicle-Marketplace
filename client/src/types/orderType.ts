export interface Order {
  // Meeting info for deposit orders (actual field name from server is 'meeting')
  meeting?: {
    location?: string | null;
    address?: string | null;
    time?: string | null;
    isSuggestion?: boolean;
    updatedBy?:
      | {
          _id: string;
          name: string;
          email: string;
          role: string;
        }
      | string
      | null;
  } | null;
  // Alias for backwards compatibility (maps to 'meeting')
  meetingInfo?: {
    location?: string | null;
    address?: string | null;
    time?: string | null;
    isSuggestion?: boolean;
    updatedBy?:
      | {
          _id: string;
          name: string;
          email: string;
          role: string;
        }
      | string
      | null;
  } | null;
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
    | "deposit"
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
    | "deposit_refunded";

  // Shipping info (may be absent or minimal for deposit/in-person orders)
  shipping?: {
    method?: string | null;
    trackingNumber?: string | null;
    carrier?: string | null;
    estimatedDelivery?: string | null;
    actualDelivery?: string | null;
    ghnShopId?: string | null;
  } | null;

  shippingAddress?: {
    fullName?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    province?: string | null;
    zipCode?: string | null;
  } | null;

  // Payment info
  payment: {
    method: "wallet" | "vnpay" | "zalopay" | "cod" | "bank_transfer";
    status: "pending" | "paid" | "refunded" | "failed";
    transactionId?: string | null;
    paidAt?: string | null;
  };

  // Contract info
  contract?: {
    contractId?: string | null;
    pdfUrl?: string | null;
    signedAt?: string | null;
    contractNumber?: string | null;
  } | null;

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
