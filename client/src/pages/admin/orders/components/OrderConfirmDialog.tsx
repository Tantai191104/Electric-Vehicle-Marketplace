import { Check, DollarSign } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types/orderType";

interface OrderConfirmDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    actionType: Order["status"] | null;
    onConfirm: () => void;
}

export default function OrderConfirmDialog({
    open,
    setOpen,
    actionType,
    onConfirm,
}: OrderConfirmDialogProps) {
    const isConfirm = actionType === "confirmed";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        {isConfirm ? (
                            <Check className="h-6 w-6 text-green-600" />
                        ) : (
                            <DollarSign className="h-6 w-6 text-red-600" />
                        )}
                        <DialogTitle>
                            {isConfirm ? "Xác nhận đơn hàng" : "Hoàn tiền đơn hàng"}
                        </DialogTitle>
                    </div>

                    <DialogDescription>
                        {isConfirm
                            ? "Bạn chắc chắn muốn xác nhận đơn hàng này? Hành động này sẽ cập nhật trạng thái đơn."
                            : "Bạn chắc chắn muốn hoàn tiền cho đơn hàng này? Hành động này sẽ thực hiện hoàn tiền."}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Hủy</Button>
                    </DialogClose>
                    <Button
                        onClick={onConfirm}
                        className={
                            "ml-2 " +
                            (isConfirm
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white")
                        }
                    >
                        {isConfirm ? "Xác nhận" : "Hoàn tiền"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
