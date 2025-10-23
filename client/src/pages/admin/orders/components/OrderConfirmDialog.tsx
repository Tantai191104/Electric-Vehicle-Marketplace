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
import { Input } from "@/components/ui/input";
import type { Order } from "@/types/orderType";
import { useState } from "react";

interface OrderConfirmDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    actionType: Order["status"] | null;
    onConfirm: (file: File | null) => void;
}

export default function OrderConfirmDialog({
    open,
    setOpen,
    actionType,
    onConfirm,
}: OrderConfirmDialogProps) {
    const isConfirm = actionType === "confirmed";
    const [contractFile, setContractFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setContractFile(file);
    };

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

                {isConfirm && (
                    <div className="mt-4">
                        <label
                            htmlFor="contract-upload"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Tải lên hợp đồng (PDF):
                        </label>
                        <Input
                            id="contract-upload"
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="mt-2"
                        />
                    </div>
                )}

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Hủy</Button>
                    </DialogClose>
                    <Button
                        onClick={() => onConfirm(contractFile)}
                        className={
                            "ml-2 " +
                            (isConfirm
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white")
                        }
                        disabled={isConfirm && !contractFile}
                    >
                        {isConfirm ? "Xác nhận" : "Hoàn tiền"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
