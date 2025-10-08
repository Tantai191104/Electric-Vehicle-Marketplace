import { useState } from "react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { orderServices } from "@/services/orderServices";
import type { Order } from "@/types/orderType";

export const useCancelOrder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const initiateCancelOrder = (order: Order) => {
    // Kiểm tra xem đơn hàng có thể hủy không (chỉ pending)
    if (order.status !== "pending") {
      toast.error("Chỉ có thể hủy đơn hàng ở trạng thái chờ xử lý");
      return;
    }

    setOrderToCancel(order);
    setShowConfirmModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      setIsLoading(true);

      // Nếu có tracking number (đơn GHN), hủy qua API GHN
      if (orderToCancel.shipping?.trackingNumber) {
        await orderServices.cancelOrder(orderToCancel.shipping.trackingNumber);
        toast.success(
          `Đơn hàng GHN #${orderToCancel.orderNumber} đã được hủy thành công!`,
          {
            description: `Mã vận đơn: ${orderToCancel.shipping.trackingNumber}`,
            duration: 5000,
          }
        );
      } else {
        // Hủy đơn hàng thông thường qua API backend
        await axiosInstance.post(`/orders/${orderToCancel._id}/cancel`);
        toast.success(
          `Đơn hàng #${orderToCancel.orderNumber} đã được hủy thành công!`,
          {
            duration: 4000,
          }
        );
      }

      // Close modal first
      setShowConfirmModal(false);
      setOrderToCancel(null);

      // Delay một chút để user thấy success message trước khi reload
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: unknown) {
      console.error("Error canceling order:", error);
      let errorMessage = "Không thể hủy đơn hàng";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage, {
        description: "Vui lòng thử lại sau hoặc liên hệ hỗ trợ",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeCancelModal = () => {
    if (!isLoading) {
      setShowConfirmModal(false);
      setOrderToCancel(null);
    }
  };

  return {
    isLoading,
    showConfirmModal,
    orderToCancel,
    initiateCancelOrder,
    confirmCancelOrder,
    closeCancelModal,
  };
};
