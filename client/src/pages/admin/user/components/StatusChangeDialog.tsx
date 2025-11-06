import { useState } from "react";
import { CheckCircle, ShieldAlert } from "lucide-react";
import { FiAlertTriangle, FiClock, FiShield } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import type { User } from "@/types/authType";

interface StatusChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  pendingStatus: "active" | "inactive";
  onConfirm: (
    userId: string,
    newStatus: "inactive" | "active",
    reason: string
  ) => void;
}

const REASONS = [
  {
    label: "Vi phạm điều khoản",
    icon: <FiShield className="w-4 h-4 text-red-500" />,
  },
  {
    label: "Không hoạt động",
    icon: <FiClock className="w-4 h-4 text-yellow-500" />,
  },
  {
    label: "Yêu cầu từ admin",
    icon: <FiAlertTriangle className="w-4 h-4 text-blue-500" />,
  },
];

export function StatusChangeDialog({
  isOpen,
  onClose,
  user,
  pendingStatus,
  onConfirm,
}: StatusChangeDialogProps) {
  const [step, setStep] = useState<"select" | "confirm">("select");
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [extraReason, setExtraReason] = useState<string>("");

  const handleClose = () => {
    onClose();
    setStep("select");
    setSelectedReason("");
    setExtraReason("");
  };

  const handleNext = () => {
    if (!selectedReason) return;
    setStep("confirm");
  };

  const handleConfirm = () => {
    if (!user._id) {
      console.error("User ID is missing");
      return;
    }
    const finalReason = extraReason.trim()
      ? `${selectedReason} - ${extraReason.trim()}`
      : selectedReason;
    onConfirm(user._id, pendingStatus, finalReason);
    handleClose();
  };

  const finalReason = extraReason.trim()
    ? `${selectedReason} - ${extraReason.trim()}`
    : selectedReason;

  return (
    <>
      {/* Step 1: Select reason */}
      {step === "select" && isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={handleClose}
          />

          {/* Form */}
          <div className="fixed z-50 w-72 bg-white border border-gray-200 shadow-2xl rounded-xl p-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[80vh] overflow-y-auto animate-fade-in">
            <span className="text-sm font-semibold text-gray-700">
              Chọn lý do chính cho{" "}
              <span className="text-blue-600">{user.name}</span>:
            </span>
            <ul className="mt-2 space-y-1">
              {REASONS.map((item) => (
                <li
                  key={item.label}
                  className={`flex items-center cursor-pointer p-2 rounded-lg transition-all ${
                    selectedReason === item.label
                      ? "bg-blue-50 font-semibold border border-blue-300"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedReason(item.label)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </li>
              ))}
            </ul>

            <div className="mt-3">
              <span className="text-sm font-semibold text-gray-700">
                Bổ sung lý do (tuỳ chọn):
              </span>
              <Textarea
                value={extraReason}
                onChange={(e) => setExtraReason(e.target.value)}
                placeholder="Nhập thêm chi tiết..."
                className="mt-1 w-full resize-none min-h-[60px] border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="rounded-lg"
              >
                Hủy
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedReason}
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg shadow-lg flex items-center gap-2 px-5 py-2 font-semibold transition-all"
              >
                <CheckCircle className="w-5 h-5" /> Tiếp theo
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Step 2: Confirm */}
      <Dialog
        open={step === "confirm" && isOpen}
        onOpenChange={(open) => !open && handleClose()}
      >
        <DialogContent className="max-w-sm bg-white border border-gray-200 shadow-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600 mb-1">
              Xác nhận thay đổi trạng thái
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 text-gray-800">
            <div className="flex items-center gap-2 mb-2 text-sm text-red-500">
              <ShieldAlert className="w-4 h-4" />
              Thao tác này sẽ thay đổi trạng thái tài khoản!
            </div>
            Bạn có chắc chắn muốn{" "}
            <span className="font-semibold">
              {pendingStatus === "inactive" ? "Vô hiệu hóa" : "Kích hoạt"}
            </span>{" "}
            cho user{" "}
            <span className="font-semibold text-blue-600">{user.name}</span>?
            <div className="mt-2">
              <span className="font-semibold">Lý do: </span>
              <span className="italic">{finalReason}</span>
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="rounded-lg"
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-lg shadow-lg flex items-center gap-2 px-5 py-2 font-semibold transition-all"
            >
              <CheckCircle className="w-5 h-5" /> Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
