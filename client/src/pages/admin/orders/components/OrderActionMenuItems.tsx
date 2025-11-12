import { Check, DollarSign, Calendar } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

import type { Order } from "@/types/orderType";

interface Props {
    allowConfirm: boolean;
    allowRefund: boolean;
    isDepositOrder: boolean;
    onOpenConfirm: (status: Order['status']) => void;
    onScheduleMeeting?: () => void;
}

export default function OrderActionMenuItems({
    allowConfirm,
    allowRefund,
    isDepositOrder,
    onOpenConfirm,
    onScheduleMeeting
}: Props) {
    return (
        <>
            

            {/* Always render the action list; individual items are enabled/disabled by props.
                Schedule will appear for deposit orders without a meeting; Confirm requires
                allowConfirm and Refund requires allowRefund. */}
            <>
                {/* Schedule (still allow opening schedule even if meeting exists) */}
                {isDepositOrder && onScheduleMeeting && (
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            onScheduleMeeting();
                        }}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg"
                    >
                        <Calendar className="h-4 w-4 text-blue-500" /> Lên lịch cuộc hẹn
                    </DropdownMenuItem>
                )}

                {/* Confirm: show tooltip when disabled to explain why */}
                {!allowConfirm ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="block">
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg"
                                    disabled
                                >
                                    <Check className="h-4 w-4 text-green-500" /> Xác nhận
                                </DropdownMenuItem>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>Cần lịch hẹn trước khi xác nhận</TooltipContent>
                    </Tooltip>
                ) : (
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!allowConfirm) return;
                            onOpenConfirm("confirmed");
                        }}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg"
                    >
                        <Check className="h-4 w-4 text-green-500" /> Xác nhận
                    </DropdownMenuItem>
                )}

                {/* Refund: always render; enabled/disabled depends on allowRefund */}
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!allowRefund) return;
                        onOpenConfirm("refunded");
                    }}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg"
                    disabled={!allowRefund}
                >
                    <DollarSign className="h-4 w-4 text-red-500" /> Hoàn tiền
                </DropdownMenuItem>
            </>
        </>
    );
}
