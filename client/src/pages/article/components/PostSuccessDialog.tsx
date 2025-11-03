import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PostSuccessDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const PostSuccessDialog: React.FC<PostSuccessDialogProps> = ({ open, onOpenChange }) => {
    const navigate = useNavigate();
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden bg-white shadow-2xl">
                <div className="border-b px-6 py-4 bg-gray-50">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold text-gray-900">Đăng tin thành công!</DialogTitle>
                    </DialogHeader>
                </div>
                <div className="px-6 pt-4 pb-2">
                    <div className="font-semibold text-gray-700 text-base mb-3 text-center">Bạn muốn chuyển sang trang quản lý tin hay tiếp tục đăng tin mới?</div>
                    <div className="flex gap-4 justify-center mt-6">
                        <Button variant="secondary" onClick={() => { onOpenChange(false); navigate("/own/product"); }}>Quản lý tin</Button>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Ở lại trang này</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PostSuccessDialog;
