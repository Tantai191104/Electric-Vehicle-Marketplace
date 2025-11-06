import { useState, useEffect } from "react";
import { Check, DollarSign, Loader2, Eye, Upload, FileText, X } from "lucide-react";
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
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [consentChecked, setConsentChecked] = useState(false);
    const [fileHash, setFileHash] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const maxFileSize = 30 * 1024 * 1024; // 10 MB

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    useEffect(() => {
        if (!open && previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setContractFile(null);
            setConsentChecked(false);
            setFileHash(null);
        }
    }, [open, previewUrl]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const processFile = (file: File) => {
        if (file.type === "application/pdf") {
            if (file.size > maxFileSize) {
                alert(`Kích thước file quá lớn. Vui lòng chọn file <= ${maxFileSize / (1024 * 1024)}MB`);
                return;
            }
            setContractFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setConsentChecked(false);
            computeFileHash(file).then(h => setFileHash(h)).catch(() => setFileHash(null));
        } else {
            alert("Vui lòng chọn đúng file PDF!");
        }
    };

    const clearSelectedFile = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setContractFile(null);
        setPreviewUrl(null);
        setFileHash(null);
        setConsentChecked(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const sanitizeFileName = (name: string) => name.split(/[/\\]/).pop() || name;

    async function computeFileHash(file: File) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const digest = await crypto.subtle.digest('SHA-256', arrayBuffer);
            const hashArray = Array.from(new Uint8Array(digest));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        } catch (e) {
            console.error('Hashing failed', e);
            return null;
        }
    }

    const handlePreview = () => {
        if (previewUrl) {
            window.open(previewUrl, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        {isConfirm ? (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                <Check className="h-6 w-6 text-green-600" />
                            </div>
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <DollarSign className="h-6 w-6 text-red-600" />
                            </div>
                        )}
                        <div>
                            <DialogTitle className="text-xl">
                                {isConfirm ? "Xác nhận đơn hàng" : "Hoàn tiền đơn hàng"}
                            </DialogTitle>
                            <DialogDescription className="mt-1">
                                {isConfirm
                                    ? "Tải lên hợp đồng đã ký để hoàn tất xác nhận"
                                    : "Xác nhận hoàn tiền cho khách hàng"}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {isConfirm && (
                    <div className="space-y-5 mt-6">
                        {/* Upload Area or File Display */}
                        {!contractFile ? (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`relative rounded-xl border-2 border-dashed transition-all ${
                                    isDragging
                                        ? "border-blue-500 bg-blue-50 scale-[1.02]"
                                        : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                                }`}
                            >
                                <input
                                    id="contract-upload"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                                />
                                <div className="flex flex-col items-center justify-center py-12 px-6 text-center pointer-events-none">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
                                        <Upload className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <p className="text-base font-semibold text-gray-900 mb-2">
                                        Tải lên hợp đồng đã ký
                                    </p>
                                    <p className="text-sm text-gray-600 mb-1">
                                        Kéo thả file PDF vào đây hoặc nhấn để chọn
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Chỉ chấp nhận file PDF • Tối đa 10MB
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* File Preview Card */
                            <div className="rounded-xl border-2 border-gray-200 bg-white overflow-hidden">
                                {/* File Header */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-green-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
                                                <FileText className="h-5 w-5 text-white" />
                                            </div>
                                            <span className="text-sm font-medium text-green-900">
                                                File đã chọn
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearSelectedFile}
                                            disabled={isUploading}
                                            className="h-8 w-8 p-0 text-green-700 hover:text-green-900 hover:bg-green-100"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* File Info */}
                                <div className="p-5 space-y-4">
                                    {/* File Name */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">Tên file</p>
                                        <p className="text-sm font-medium text-gray-900 break-all">
                                            {sanitizeFileName(contractFile.name)}
                                        </p>
                                    </div>

                                    {/* File Details Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">Kích thước</p>
                                            <p className="text-sm text-gray-900">{formatFileSize(contractFile.size)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">Định dạng</p>
                                            <p className="text-sm text-gray-900">PDF</p>
                                        </div>
                                    </div>

                                    {/* Fingerprint */}
                                    {fileHash && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">Fingerprint (SHA-256)</p>
                                            <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono break-all block">
                                                {fileHash.slice(0, 16)}...
                                            </code>
                                        </div>
                                    )}

                                    {/* Preview Button */}
                                    <Button
                                        variant="outline"
                                        onClick={handlePreview}
                                        disabled={!previewUrl}
                                        className="w-full"
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Xem trước file PDF
                                    </Button>
                                </div>

                                {/* Consent Section */}
                                <div className="bg-gray-50 border-t border-gray-200 px-5 py-4">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={consentChecked}
                                            onChange={e => setConsentChecked(e.target.checked)}
                                            disabled={isUploading}
                                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                        <div className="text-sm leading-relaxed">
                                            <span className="text-gray-700 group-hover:text-gray-900">
                                                Tôi xác nhận đã <strong className="text-gray-900">kiểm tra kỹ</strong> nội dung hợp đồng 
                                                và hiểu rằng file này <strong className="text-red-600">không thể thay đổi</strong> sau khi tải lên.
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!isConfirm && (
                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm text-gray-700">
                            Bạn chắc chắn muốn hoàn tiền cho đơn hàng này? Hành động này không thể hoàn tác.
                        </p>
                    </div>
                )}

                <DialogFooter className="mt-6 gap-2 sm:gap-2">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isUploading} className="flex-1 sm:flex-none">
                            Hủy
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={() => onConfirm(contractFile)}
                        className={`flex-1 sm:flex-none ${
                            isConfirm
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                        disabled={(isConfirm && (!contractFile || !consentChecked)) || isUploading}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : isConfirm ? (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Xác nhận
                            </>
                        ) : (
                            <>
                                <DollarSign className="mr-2 h-4 w-4" />
                                Hoàn tiền
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}