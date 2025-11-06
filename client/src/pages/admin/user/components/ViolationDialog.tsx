import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import {
  FiAlertTriangle,
  FiAlertOctagon,
  FiXOctagon,
  FiFileText,
  FiShield,
} from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  violationServices,
  type ViolationType,
} from "@/services/violationServices";
import type { User } from "@/types/authType";

interface ViolationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function ViolationDialog({
  isOpen,
  onClose,
  user,
}: ViolationDialogProps) {
  const [violationType, setViolationType] = useState<ViolationType>("spam");
  const [violationDesc, setViolationDesc] = useState<string>("");
  const [violationSeverity, setViolationSeverity] = useState<
    "low" | "medium" | "high"
  >("low");
  const [violationAction, setViolationAction] = useState<
    "warning" | "suspension" | "ban"
  >("warning");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    onClose();
    // Reset form
    setViolationType("spam");
    setViolationDesc("");
    setViolationSeverity("low");
    setViolationAction("warning");
  };

  const handleSubmit = async () => {
    if (!violationType || !violationDesc.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin vi phạm");
      return;
    }

    setLoading(true);
    try {
      await violationServices.createViolation(String(user._id), {
        violationType,
        description: violationDesc.trim(),
        severity: violationSeverity,
        action: violationAction,
      });
      toast.success("✅ Đã tạo vi phạm cho user!", {
        description: `${user.name} - ${violationType}`,
      });
      handleClose();
    } catch (error) {
      console.error("Create violation error:", error);
      toast.error("❌ Tạo vi phạm thất bại", {
        description: "Vui lòng thử lại sau",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-white border border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6" />
            Tạo vi phạm cho user
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Tạo báo cáo vi phạm cho{" "}
            <span className="font-semibold text-gray-900">{user.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Loại vi phạm */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              Loại vi phạm <span className="text-red-500">*</span>
            </label>
            <Select
              value={violationType}
              onValueChange={(value) => setViolationType(value as ViolationType)}
            >
              <SelectTrigger className="w-full border-gray-300">
                <SelectValue placeholder="Chọn loại vi phạm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">
                  <div className="flex items-center gap-2">
                    <FiAlertTriangle className="w-4 h-4 text-orange-500" />
                    <span>Spam</span>
                  </div>
                </SelectItem>
                <SelectItem value="fake_product">
                  <div className="flex items-center gap-2">
                    <FiXOctagon className="w-4 h-4 text-red-500" />
                    <span>Sản phẩm giả mạo</span>
                  </div>
                </SelectItem>
                <SelectItem value="fraud">
                  <div className="flex items-center gap-2">
                    <FiAlertOctagon className="w-4 h-4 text-red-600" />
                    <span>Lừa đảo</span>
                  </div>
                </SelectItem>
                <SelectItem value="inappropriate">
                  <div className="flex items-center gap-2">
                    <FiShield className="w-4 h-4 text-purple-500" />
                    <span>Nội dung không phù hợp</span>
                  </div>
                </SelectItem>
                <SelectItem value="other">
                  <div className="flex items-center gap-2">
                    <FiFileText className="w-4 h-4 text-gray-500" />
                    <span>Khác</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={violationDesc}
              onChange={(e) => setViolationDesc(e.target.value)}
              placeholder="Nhập mô tả chi tiết về vi phạm..."
              className="min-h-[100px] border-gray-300 focus:border-red-500 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500">
              Mô tả rõ ràng giúp xử lý vi phạm hiệu quả hơn
            </p>
          </div>

          {/* Mức độ và Hành động */}
          <div className="grid grid-cols-2 gap-4">
            {/* Mức độ nghiêm trọng */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Mức độ nghiêm trọng
              </label>
              <Select
                value={violationSeverity}
                onValueChange={(value) =>
                  setViolationSeverity(value as "low" | "medium" | "high")
                }
              >
                <SelectTrigger className="w-full border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Thấp</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>Trung bình</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Cao</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Hành động xử lý */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Hành động xử lý
              </label>
              <Select
                value={violationAction}
                onValueChange={(value) =>
                  setViolationAction(value as "warning" | "suspension" | "ban")
                }
              >
                <SelectTrigger className="w-full border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">
                    <div className="flex items-center gap-2">
                      <FiAlertTriangle className="w-4 h-4 text-orange-500" />
                      <span>Cảnh báo</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="suspension">
                    <div className="flex items-center gap-2">
                      <FiShield className="w-4 h-4 text-purple-500" />
                      <span>Tạm khóa</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ban">
                    <div className="flex items-center gap-2">
                      <FiXOctagon className="w-4 h-4 text-red-500" />
                      <span>Cấm vĩnh viễn</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Warning box */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
              <p>
                Vi phạm sẽ được ghi nhận vào hồ sơ người dùng và có thể ảnh
                hưởng đến tài khoản của họ.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !violationType || !violationDesc.trim()}
            className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-lg shadow-lg flex items-center gap-2 px-5 py-2 font-semibold transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang tạo...
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                Tạo vi phạm
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
