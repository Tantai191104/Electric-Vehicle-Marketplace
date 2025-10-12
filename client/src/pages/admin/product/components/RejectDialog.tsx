import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import type { Product } from "@/types/productType";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  product: Product | null;
  isLoading?: boolean;
}

const PRESET_REASONS = [
  "Sản phẩm không đáp ứng tiêu chuẩn chất lượng",
  "Hình ảnh không rõ ràng hoặc không phù hợp",
  "Mô tả sản phẩm thiếu thông tin quan trọng",
  "Giá cả không hợp lý",
  "Sản phẩm không thuộc danh mục được phép",
  "Vi phạm chính sách của nền tảng",
];

export const RejectDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  product,
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (reason.trim() && confirmed) {
      onConfirm(reason.trim());
      handleClose();
    }
  };

  const handleClose = () => {
    setReason("");
    setConfirmed(false);
    onClose();
  };

  const selectPresetReason = (presetReason: string) => {
    setReason(presetReason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FiX className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-red-900">
                Từ chối sản phẩm
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Vui lòng cung cấp lý do từ chối để người bán hiểu rõ
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          {product && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-start gap-4">
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {product.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {product.brand} {product.model} • {product.year}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {product.condition}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preset Reasons */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Chọn lý do phổ biến:
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_REASONS.map((presetReason, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectPresetReason(presetReason)}
                  className={`p-3 text-left border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors ${reason === presetReason
                    ? "bg-blue-50 border-blue-300 text-blue-900"
                    : "bg-white border-gray-200 text-gray-700"
                    }`}
                >
                  <div className="text-sm">{presetReason}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          <div>
            <Label
              htmlFor="custom-reason"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Hoặc nhập lý do tùy chỉnh: <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="custom-reason"
              placeholder="Nhập lý do từ chối chi tiết..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Lý do này sẽ được gửi đến người bán
              </p>
              <span className="text-xs text-gray-400">{reason.length}/500</span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-yellow-900 mb-1">
                  Lưu ý quan trọng
                </h5>
                <p className="text-sm text-yellow-800">
                  Hành động này không thể hoàn tác. Sản phẩm sẽ bị từ chối và
                  người bán sẽ nhận được thông báo kèm lý do.
                </p>
              </div>
            </div>
          </div>

          {/* Confirm Checkbox */}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            Tôi xác nhận muốn từ chối sản phẩm này
          </label>
        </div>

        <DialogFooter className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || !confirmed || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang xử lý...
              </div>
            ) : (
              "Từ chối sản phẩm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
