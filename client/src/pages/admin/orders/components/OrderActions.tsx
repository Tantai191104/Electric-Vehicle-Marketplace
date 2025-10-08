import {
  Eye,
  MoreHorizontal,
  Info,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
}: OrderActionsProps) {
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}