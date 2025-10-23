import { useState } from "react";
import { Eye, MoreHorizontal, Info } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import OrderConfirmDialog from "./OrderConfirmDialog";
import { contractServices } from '@/services/contractServices';
import { toast } from 'sonner';
import OrderActionMenuItems from "./OrderActionMenuItems";
import type { Order } from "@/types/orderType";
interface OrderActionsProps {
  order: Order;
  onView: (order: Order) => void;
  onStatusChange: (
    orderId: string,
    newStatus: Order['status'],
    reason?: string
  ) => void;
}

export function OrderActions({
  order,
  onView,
  onStatusChange,
}: OrderActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<Order['status'] | null>(null);

  const openConfirm = (status: Order['status']) => {
    setActionType(status);
    setConfirmOpen(true);
  };

  const handleConfirm = async (file?: File | null) => {
    if (!actionType) return;

    // If confirming and a file is provided, attempt to upload and sign contract first
    if (actionType === 'confirmed') {
      try {
        console.log('Uploading and signing contract PDF for order', order);
        if (file && order.contract && order.contract.contractId) {
          await contractServices.signContract(order.contract.contractId, file);
          toast.success('Hợp đồng đã được tải lên và ký thành công');
        } else if (!file) {
          // No file provided - in the UI confirm button is disabled when missing, but guard anyway
          toast.error('Vui lòng chọn file PDF hợp đồng trước khi xác nhận');
          return;
        } else {
          // No contract ID available on the order
          toast.error('Không tìm thấy contractId cho đơn hàng này.');
          // proceed to update status anyway or return? we'll return to avoid inconsistent state
          return;
        }
      } catch (err) {
        console.error('Failed to upload contract PDF', err);
        toast.error('Tải hợp đồng thất bại. Vui lòng thử lại.');
        return;
      }
    }

    // If we reach here, either it's not a confirm action or the upload succeeded
    onStatusChange(order._id, actionType);
    setConfirmOpen(false);
    setActionType(null);
  };
  return (
    <div className="flex justify-end relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-8 w-8 p-0 flex items-center justify-center rounded-md bg-white border border-gray-200 shadow hover:bg-gray-100 transition">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="z-50 bg-white shadow-xl border border-gray-200 rounded-xl min-w-[180px] py-2"
        >
          <DropdownMenuLabel className="font-semibold text-gray-700">
            Thao tác
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => onView(order)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg"
          >
            <Eye className="h-4 w-4 text-blue-500" /> Xem chi tiết
          </DropdownMenuItem>
          {/* If order is managed by GHN, show read-only info. Otherwise show in-person actions only when status is 'pending' */}
          {(() => {
            const method = typeof order.shipping?.method === 'string' ? order.shipping.method.toLowerCase() : '';
            const isGHN = method.includes('ghn');
            const isInPerson = method === 'in-person' || method === 'in_person' || method.includes('in person') || method.includes('pickup') || method.includes('store');
            const allowActions = isInPerson && order.status != 'delivered' && order.status != 'cancelled' && order.status != 'refunded';
            console.log({ method, isGHN, isInPerson, allowActions, status: order.status });
            if (isGHN) {
              return (
                <DropdownMenuItem
                  disabled
                  className="flex items-center gap-2 px-3 py-2 text-gray-400 cursor-not-allowed"
                >
                  <Info className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="text-xs">Đơn hàng GHN</span>
                    <span className="text-xs">Chỉ xem được</span>
                  </div>
                </DropdownMenuItem>
              );
            }

            // For non-GHN orders, only allow confirm/refund when explicitly in-person and status is pending
            return (
              <OrderActionMenuItems allowActions={allowActions} onOpenConfirm={openConfirm} />
            );
          })()}
        </DropdownMenuContent>
      </DropdownMenu>

      <OrderConfirmDialog open={confirmOpen} setOpen={setConfirmOpen} actionType={actionType} onConfirm={handleConfirm} />
    </div>
  );
}