import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatNumberWithDots } from "@/utils/numberFormatter";
import { toast } from "sonner";
import { CancelOrderModal } from "./CancelOrderModal";
import { useCancelOrder } from "@/hooks/useCancelOrder";
import type { Order } from "@/types/orderType";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiCreditCard,
  FiCalendar,
  FiFileText
} from "react-icons/fi";
import { MdPayment, MdLocalShipping } from "react-icons/md";

interface OrderCardProps {
  order: Order;
  navigate: (path: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, navigate }) => {
  const {
    isLoading,
    showConfirmModal,
    orderToCancel,
    initiateCancelOrder,
    confirmCancelOrder,
    closeCancelModal
  } = useCancelOrder();
  const statusConfig = {
    pending: {
      label: "Chờ xử lý",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      borderColor: "border-gray-300"
    },
    confirmed: {
      label: "Đã xác nhận",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      borderColor: "border-blue-300"
    },
    shipping: {
      label: "Đang giao",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-300"
    },
    delivered: {
      label: "Đã giao",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-green-300"
    },
    cancelled: {
      label: "Đã hủy",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "border-red-300"
    },
    refunded: {
      label: "Đã hoàn tiền",
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
      borderColor: "border-purple-300"
    }
  };

  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;

  // Handler functions
  const handleTrackOrder = (trackingNumber: string, carrier: string) => {
    let trackingUrl = '';
    switch (carrier.toLowerCase()) {
      case 'ghn':
        trackingUrl = `https://tracking.ghn.dev/?order_code=${trackingNumber}`;
        break;
      case 'ghtk':
        trackingUrl = `https://i.ghtk.vn/${trackingNumber}`;
        break;
      case 'viettel':
        trackingUrl = `https://viettelpost.com.vn/tra-cuu-hanh-trinh-don/?code=${trackingNumber}`;
        break;
      default:
        toast.info(`Mã tracking: ${trackingNumber}`);
        return;
    }
    window.open(trackingUrl, '_blank');
  };

  const handlePayOrder = (orderId: string) => {
    navigate(`/payment/${orderId}`);
  };

  // Call return API for GHN delivered_fail
  const handleReturnOrder = async () => {
    try {
      const res = await fetch('/shipping/order/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: order._id }),
      });
      if (res.ok) {
        toast.success('Yêu cầu trả hàng đã được gửi!');
      } else {
        toast.error('Gửi yêu cầu trả hàng thất bại!');
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra khi gửi yêu cầu trả hàng!');
      console.error(err);
    }
  };

  // Helper function to translate status to Vietnamese
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'Chờ xử lý',
      'deposit': 'Chờ xử lý',
      'confirmed': 'Đã xác nhận',
      'shipping': 'Đang giao',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy',
      'refunded': 'Đã hoàn tiền',
      'paid': 'Đã thanh toán',
      'unpaid': 'Chưa thanh toán',
      'processing': 'Đang xử lý',
      'completed': 'Hoàn thành'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  // Helper function to get badge color for status
  const getStatusBadgeClass = (status: string): string => {
    const colorMap: Record<string, string> = {
      'pending': 'bg-gray-100 text-gray-700 border-gray-300',
      'deposit': 'bg-gray-100 text-gray-700 border-gray-300',
      'confirmed': 'bg-blue-100 text-blue-700 border-blue-300',
      'shipping': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'delivered': 'bg-green-100 text-green-700 border-green-300',
      'cancelled': 'bg-red-100 text-red-700 border-red-300',
      'refunded': 'bg-purple-100 text-purple-700 border-purple-300',
      'paid': 'bg-emerald-100 text-emerald-700 border-emerald-300',
      'unpaid': 'bg-orange-100 text-orange-700 border-orange-300',
      'processing': 'bg-indigo-100 text-indigo-700 border-indigo-300',
      'completed': 'bg-teal-100 text-teal-700 border-teal-300'
    };
    return colorMap[status.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const isDepositOrder = order.shipping?.method !== "GHN";
  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FiFileText className="w-5 h-5 text-black" />
              <CardTitle className="text-lg font-bold text-black">
                Đơn hàng #{order.orderNumber}
              </CardTitle>
              {!isDepositOrder && order.shipping?.trackingNumber && (
                <Badge variant="outline" className="text-xs border-blue-500 text-blue-600 bg-blue-50">
                  GHN
                </Badge>
              )}
            </div>
            <Badge className={`flex items-center gap-1 ${status.bgColor} ${status.textColor} border-0`}>
              {order.status === "pending" && <FiClock className="w-3 h-3" />}
              {order.status === "confirmed" && <FiPackage className="w-3 h-3" />}
              {order.status === "shipping" && <FiTruck className="w-3 h-3" />}
              {order.status === "delivered" && <FiCheckCircle className="w-3 h-3" />}
              {status.label}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-700">
            <div className="flex items-center gap-1">
              <FiCalendar className="w-4 h-4" />
              <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            {/* Nếu là đơn đặt cọc */}
            {isDepositOrder && (
              order.meetingInfo ? (
                <div className="flex flex-col gap-1 ml-4">
                  <div className="flex items-center gap-1">
                    <FiMapPin className="w-4 h-4" />
                    <span className="font-semibold">Địa điểm gặp mặt:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{order.meetingInfo.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiCalendar className="w-4 h-4" />
                    <span className="font-semibold">Thời gian:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{order.meetingInfo.time}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-4">
                  <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                    Thông tin sẽ được liên hệ trực tiếp với bạn sau
                  </Badge>
                </div>
              )
            )}
            {/* Nếu là đơn GHN thì hiện tracking như cũ */}
            {!isDepositOrder && order.shipping?.trackingNumber && (
              <div className="flex items-center gap-1">
                <MdLocalShipping className="w-4 h-4" />
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {order.shipping.trackingNumber}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Order Items */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={order.productId.images?.[0] || "/images/placeholder.jpg"}
                alt={order.productId.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-black truncate">{order.productId.title}</h4>
              <div className="flex items-center gap-4 text-sm text-gray-700 mt-1">
                <span>Số lượng: {order.quantity}</span>
                <span className="font-semibold text-black">
                  {formatNumberWithDots(order.unitPrice)} VNĐ
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Người bán: {order.sellerId.name}
              </div>
            </div>

            <Badge variant="outline" className="shrink-0 border-gray-300 text-gray-700">
              Sản phẩm
            </Badge>
          </div>
        </div>

        <Separator className="my-6 bg-gray-200" />

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Info or Meeting Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-black flex items-center gap-2">
              <FiMapPin className="w-4 h-4" />
              {isDepositOrder ? "Thông tin lịch hẹn" : "Thông tin giao hàng"}
            </h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              {isDepositOrder ? (
                order.meetingInfo ? (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <FiMapPin className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-black">Địa điểm gặp mặt:</span>
                      <span className="text-gray-700">{order.meetingInfo.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FiCalendar className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-black">Thời gian:</span>
                      <span className="text-gray-700">{order.meetingInfo.time}</span>
                    </div>
                  </>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiClock className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900 text-sm mb-1">Đang xử lý thông tin</p>
                        <p className="text-xs text-blue-700">
                          Thông tin lịch hẹn sẽ được liên hệ trực tiếp với bạn sau. Vui lòng kiểm tra email và điện thoại thường xuyên.
                        </p>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <FiUser className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-black">{order.shippingAddress.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiPhone className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">{order.shippingAddress.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiMail className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">{order.buyerId.email}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <FiMapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                    <span className="text-gray-700">{order.shippingAddress.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <MdLocalShipping className="w-4 h-4" />
                    <span>Vận chuyển: {order.shipping.carrier} - {order.shipping.method}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment & Total */}
          <div className="space-y-3">
            <h4 className="font-semibold text-black flex items-center gap-2">
              <MdPayment className="w-4 h-4" />
              Thanh toán
            </h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Phương thức:</span>
                <div className="flex items-center gap-1">
                  <FiCreditCard className="w-4 h-4" />
                  <span className="font-medium text-black">
                    {order.payment.method === "wallet" ? "Ví hệ thống" :
                      order.payment.method === "vnpay" ? "VNPay" :
                        order.payment.method === "zalopay" ? "ZaloPay" :
                          order.payment.method === "bank_transfer" ? "Chuyển khoản" : "COD"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Trạng thái:</span>
                <Badge className={order.payment.status === "paid" ? "bg-black text-white" : "bg-gray-100 text-gray-700"}>
                  {order.payment.status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                </Badge>
              </div>
              {order.shipping.method === "GHN" && (

                <div className="space-y-1 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{formatNumberWithDots(order.totalAmount)} VNĐ</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span>{formatNumberWithDots(order.shippingFee)} VNĐ</span>
                  </div>
                </div>
              )}
              {order.shipping.method !== "GHN" && (
                <div className="space-y-1 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Phí đặt cọc:</span>
                    <span>{formatNumberWithDots(order.finalAmount)} VNĐ</span>
                  </div>
                </div>
              )}
              <Separator className="bg-gray-300" />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-black">Tổng thanh toán:</span>
                <span className="text-xl font-bold text-black">
                  {formatNumberWithDots(order.shipping.method === "GHN" ? order.totalAmount : order.finalAmount)} VNĐ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {order.timeline && order.timeline.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-black mb-3 flex items-center gap-2">
              <FiClock className="w-4 h-4" />
              Lịch sử đơn hàng
            </h4>
            <div className="space-y-2">
              {order.timeline.map((timeline) => (
                <div key={timeline._id} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-2 h-2 bg-gray-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black">{timeline.description}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(timeline.timestamp).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <Badge className={`text-xs font-semibold border ${getStatusBadgeClass(timeline.status)}`}>
                    {getStatusLabel(timeline.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
          {order.contract && order.contract.pdfUrl ? (
            <Button
              variant="outline"
              className="flex-1 border-black text-black hover:bg-black hover:text-white transition-all duration-200"
              onClick={() => window.open(order.contract.pdfUrl, '_blank')}
            >
              <FiFileText className="w-4 h-4 mr-2" />
              Xem hợp đồng đã ký
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled
              className="flex-1 border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
            >
              <FiFileText className="w-4 h-4 mr-2" />
              Chưa có hợp đồng
            </Button>
          )}

          {/* Button for GHN orders with status delivered_fail */}
          {order.shipping?.method === "GHN" && order.status === "delivered_fail" && (
            <Button
              variant="outline"
              className="flex-1 border-yellow-400 text-yellow-700 hover:bg-yellow-400 hover:text-white transition-all duration-200"
              onClick={handleReturnOrder}
            >
              Trả hàng
            </Button>
          )}

          {order.status === "pending" && (
            <Button
              variant="outline"
              className="flex-1 border-red-400 text-red-600 hover:bg-red-400 hover:text-white transition-all duration-200 disabled:opacity-50"
              onClick={() => initiateCancelOrder(order)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Đang hủy...
                </>
              ) : (
                order.shipping?.trackingNumber ? "Hủy đơn GHN" : "Hủy đơn hàng"
              )}
            </Button>
          )}

          {order.shipping?.trackingNumber && (
            <Button
              className="flex-1 bg-gray-700 hover:bg-gray-800 text-white font-semibold transition-all duration-200"
              onClick={() => handleTrackOrder(order.shipping.trackingNumber, order.shipping.carrier)}
            >
              <FiTruck className="w-4 h-4 mr-2" />
              Theo dõi với {order.shipping.carrier}
            </Button>
          )}

          {order.payment.status !== "paid" && (
            <Button
              className="flex-1 bg-black hover:bg-gray-800 text-white transition-all duration-200"
              onClick={() => handlePayOrder(order._id)}
            >
              <MdPayment className="w-4 h-4 mr-2" />
              Thanh toán
            </Button>
          )}
        </div>
      </CardContent>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={showConfirmModal}
        onClose={closeCancelModal}
        onConfirm={confirmCancelOrder}
        order={orderToCancel}
        isLoading={isLoading}
      />
    </Card>
  );
};