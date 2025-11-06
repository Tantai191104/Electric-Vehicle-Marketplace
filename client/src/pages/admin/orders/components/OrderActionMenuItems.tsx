import { Check, DollarSign, Calendar } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import type { Order } from "@/types/orderType";

interface Props {
    allowActions: boolean;
    isDepositOrder: boolean;
    onOpenConfirm: (status: Order['status']) => void;
    onScheduleMeeting?: () => void;
}

export default function OrderActionMenuItems({ 
    allowActions, 
    isDepositOrder, 
    onOpenConfirm, 
    onScheduleMeeting 
}: Props) {
    return (
        <>
            {isDepositOrder && onScheduleMeeting && (
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!allowActions) return;
                        onScheduleMeeting();
                    }}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg"
                    disabled={!allowActions}
                >
                    <Calendar className="h-4 w-4 text-blue-500" /> Lên lịch cuộc hẹn
                </DropdownMenuItem>
            )}

            <DropdownMenuItem
                onClick={(e) => {
                    e.stopPropagation();
                    if (!allowActions) return;
                    onOpenConfirm("confirmed");
                }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg"
                disabled={!allowActions}
            >
                <Check className="h-4 w-4 text-green-500" /> Xác nhận
            </DropdownMenuItem>

            <DropdownMenuItem
                onClick={(e) => {
                    e.stopPropagation();
                    if (!allowActions) return;
                    onOpenConfirm("refunded");
                }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg"
                disabled={!allowActions}
            >
                <DollarSign className="h-4 w-4 text-red-500" /> Hoàn tiền
            </DropdownMenuItem>
        </>
    );
}
