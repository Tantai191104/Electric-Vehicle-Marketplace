import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FiAlertTriangle, FiCheck } from "react-icons/fi";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive" | "success";
    isLoading?: boolean;
}

export const ConfirmDialog: React.FC<Props> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    variant = "default",
    isLoading = false,
}) => {
    const getIcon = () => {
        switch (variant) {
            case "destructive":
                return <FiAlertTriangle className="w-6 h-6 text-red-500" />;
            case "success":
                return <FiCheck className="w-6 h-6 text-green-500" />;
            default:
                return <FiAlertTriangle className="w-6 h-6 text-blue-500" />;
        }
    };

    const getConfirmButtonVariant = () => {
        switch (variant) {
            case "destructive":
                return "destructive";
            case "success":
                return "default";
            default:
                return "default";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        {getIcon()}
                        <DialogTitle className="text-lg font-semibold">
                            {title}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-gray-600">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex gap-2 mt-6">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={getConfirmButtonVariant()}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {isLoading ? "Đang xử lý..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};