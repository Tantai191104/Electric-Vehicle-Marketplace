import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { formatVND } from "@/utils/formatVND";
import type { Order } from "@/types/orderType";

interface OrderDetailDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit", 
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export function OrderDetailDialog({
  order,
  isOpen,
  onClose,
}: OrderDetailDialogProps) {
  if (!order) return null;

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { label: "Chờ xác nhận", variant: "secondary" as const },
      confirmed: { label: "Đã xác nhận", variant: "default" as const },
      shipping: { label: "Đang giao", variant: "outline" as const },
      delivered: { label: "Đã giao", variant: "default" as const },
      cancelled: { label: "Đã hủy", variant: "destructive" as const },
      refunded: { label: "Đã hoàn tiền", variant: "secondary" as const },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (paymentStatus: Order['payment']['status']) => {
    const statusConfig = {
      pending: { label: "Chờ thanh toán", variant: "secondary" as const },
      paid: { label: "Đã thanh toán", variant: "default" as const },
      refunded: { label: "Đã hoàn tiền", variant: "outline" as const },
      failed: { label: "Thất bại", variant: "destructive" as const },
    };
    
    const config = statusConfig[paymentStatus] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Chi tiết đơn hàng {order.orderNumber}
          </DialogTitle>
          {/* GHN Notice */}
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <div className="text-sm text-blue-800">
              <span className="font-medium">Đơn hàng Giao Hàng Nhanh (GHN)</span>
              <p className="text-xs text-blue-600 mt-1">
                Đây là đơn hàng được quản lý bởi GHN. Admin chỉ có thể xem thông tin, không thể thay đổi trạng thái.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Order Info */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Thông tin đơn hàng</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thanh toán:</span>
                  {getPaymentStatusBadge(order.payment.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức:</span>
                  <span className="font-medium">
                    {order.payment.method === 'wallet' ? 'Ví điện tử' :
                     order.payment.method === 'vnpay' ? 'VNPay' :
                     order.payment.method === 'zalopay' ? 'ZaloPay' :
                     order.payment.method === 'cod' ? 'COD' : 'Chuyển khoản'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo:</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
                {order.shipping.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking:</span>
                    <span className="font-medium">{order.shipping.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Thông tin sản phẩm</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Tên sản phẩm:</span>
                  <p className="font-medium mt-1">{order.productId.title}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số lượng:</span>
                  <span className="font-medium">{order.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đơn giá:</span>
                  <span className="font-medium">{formatVND(order.unitPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí ship:</span>
                  <span className="font-medium">{formatVND(order.shippingFee)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Tổng tiền:</span>
                  <span className="font-bold text-green-600">{formatVND(order.finalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="space-y-4">
            {/* Buyer Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Thông tin người mua</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Họ tên:</span>
                  <p className="font-medium">{order.buyerId.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{order.buyerId.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Số điện thoại:</span>
                  <p className="font-medium">{order.buyerId.phone}</p>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Thông tin người bán</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Họ tên:</span>
                  <p className="font-medium">{order.sellerId.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{order.sellerId.email}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Địa chỉ giao hàng</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Người nhận:</span>
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Số điện thoại:</span>
                  <p className="font-medium">{order.shippingAddress.phone}</p>
                </div>
                <div>
                  <span className="text-gray-600">Địa chỉ:</span>
                  <p className="font-medium">
                    {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.province}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Lịch sử đơn hàng</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Đơn hàng được tạo</p>
                    <p className="text-gray-600 text-xs">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                
                {order.timeline.map((event) => (
                  <div key={event._id} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.description}</p>
                      <p className="text-gray-600 text-xs">{formatDate(event.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}