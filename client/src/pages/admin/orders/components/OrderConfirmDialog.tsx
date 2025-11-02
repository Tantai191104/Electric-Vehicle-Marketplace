import { Check, DollarSign, Loader2 } from "lucide-react";
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
    isUploading?: boolean;
}

export default function OrderConfirmDialog({
    open,
    setOpen,
    actionType,
    onConfirm,
    isUploading = false,
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
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Tải lên hợp đồng đã ký (PDF):
                        </label>
                        <Input
                            id="contract-upload"
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="mt-2"
                            disabled={isUploading}
                        />
                        {contractFile && (
                            <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                                <Check className="h-4 w-4" />
                                Đã chọn: <span className="font-medium">{contractFile.name}</span>
                            </p>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost" disabled={isUploading}>Hủy</Button>
                    </DialogClose>
                    <Button
                        onClick={() => onConfirm(contractFile)}
                        className={
                            "ml-2 " +
                            (isConfirm
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white")
                        }
                        disabled={(isConfirm && !contractFile) || isUploading}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang tải lên...
                            </>
                        ) : (
                            isConfirm ? "Xác nhận" : "Hoàn tiền"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
