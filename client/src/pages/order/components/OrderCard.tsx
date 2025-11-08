import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Button not used directly in OrderCard after refactor
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// formatNumberWithDots used in PaymentInfo component
import { toast } from "sonner";
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
  FiCalendar,
  FiFileText
} from "react-icons/fi";
import { MdLocalShipping } from "react-icons/md";
import MeetingInfo from "./MeetingInfo";
import OrderItem from "./OrderItem";
import PaymentInfo from "./PaymentInfo";
import OrderTimeline from "./OrderTimeline";
import OrderActions from "./OrderActions";

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
  const isGHNOrder = order.shipping?.method === "GHN";
  const isDepositOrder = !isGHNOrder;
  // Use 'meeting' (server field name) or 'meetingInfo' (alias) for backwards compatibility
  const meetingData = order.meeting || order.meetingInfo;
  // Debug helper: add `?forceNoMeeting=1` to the URL to force the "no meeting" UI for testing
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const forceNoMeeting = urlParams?.get('forceNoMeeting') === '1';
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
              {isGHNOrder && order.shipping?.trackingNumber && (
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
              <MeetingInfo meetingData={forceNoMeeting ? null : meetingData} compact isDepositOrder={isDepositOrder} />
            )}
            {/* Nếu là đơn GHN thì hiện tracking như cũ */}
            {isGHNOrder && order.shipping?.trackingNumber && (
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
          <OrderItem order={order} />
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
                <MeetingInfo meetingData={forceNoMeeting ? null : meetingData} isDepositOrder={isDepositOrder} />
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <FiUser className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-black">{order.shippingAddress?.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiPhone className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">{order.shippingAddress?.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <FiMapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                    <span className="text-gray-700">
                      {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.province}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <MdLocalShipping className="w-4 h-4" />
                    <span>Vận chuyển: {order.shipping?.carrier} - {order.shipping?.method}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment & Total */}
          <PaymentInfo order={order} isGHNOrder={isGHNOrder} isDepositOrder={isDepositOrder} />
        </div>

        {/* Timeline */}
        <OrderTimeline timeline={order.timeline} />

        {/* Action Buttons */}
        <OrderActions
          order={order}
          navigate={navigate}
          isLoading={isLoading}
          initiateCancelOrder={initiateCancelOrder}
          confirmCancelOrder={confirmCancelOrder}
          closeCancelModal={closeCancelModal}
          showConfirmModal={showConfirmModal}
          orderToCancel={orderToCancel}
          handleTrackOrder={handleTrackOrder}
          handlePayOrder={handlePayOrder}
          handleReturnOrder={handleReturnOrder}
        />
      </CardContent>

    </Card>
  );
};