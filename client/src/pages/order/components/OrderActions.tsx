import React from "react";
import type { Order } from "@/types/orderType";
import { Button } from "@/components/ui/button";
import { FiFileText, FiTruck } from "react-icons/fi";
import { MdPayment } from "react-icons/md";
import { CancelOrderModal } from "./CancelOrderModal";

interface OrderActionsProps {
  order: Order;
  navigate?: (path: string) => void;
  isLoading: boolean;
  initiateCancelOrder: (order: Order) => void;
  confirmCancelOrder: () => void;
  closeCancelModal: () => void;
  showConfirmModal: boolean;
  orderToCancel: Order | null;
  handleTrackOrder: (trackingNumber: string, carrier: string) => void;
  handlePayOrder: (orderId: string) => void;
  handleReturnOrder: () => Promise<void>;
}

const OrderActions: React.FC<OrderActionsProps> = ({
  order,
  isLoading,
  initiateCancelOrder,
  confirmCancelOrder,
  closeCancelModal,
  showConfirmModal,
  orderToCancel,
  handleTrackOrder,
  handlePayOrder,
  handleReturnOrder
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
        {order.contract && order.contract.pdfUrl ? (
          <Button
            variant="outline"
            className="flex-1 border-black text-black hover:bg-black hover:text-white transition-all duration-200"
            onClick={() => window.open(order.contract!.pdfUrl!, '_blank')}
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
            onClick={() => handleTrackOrder(order.shipping!.trackingNumber!, order.shipping!.carrier!)}
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

      <CancelOrderModal
        isOpen={showConfirmModal}
        onClose={closeCancelModal}
        onConfirm={confirmCancelOrder}
        order={orderToCancel}
        isLoading={isLoading}
      />
    </>
  );
};

export default OrderActions;
