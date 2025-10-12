import { useState } from "react";
import {
  Ban,
  CheckCircle,
  Eye,
  MoreHorizontal,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/types/authType";

interface UserActionsProps {
  user: User;
  onView: (user: User) => void;
  onStatusChange: (
    userId: string,
    newStatus: "inactive" | "active",
    reason: string
  ) => void;
}

const REASONS = [
  {
    label: "Vi phạm điều khoản",
    icon: <ShieldAlert className="mr-2 h-4 w-4 text-red-500" />,
  },
  {
    label: "Không hoạt động",
    icon: <Ban className="mr-2 h-4 w-4 text-yellow-500" />,
  },
  {
    label: "Yêu cầu từ admin",
    icon: <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />,
  },
];

export function UserActions({
  user,
  onView,
  onStatusChange,
}: UserActionsProps) {
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [extraReason, setExtraReason] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [pendingStatus, setPendingStatus] = useState<"active" | "inactive">(
    user.isActive ? "inactive" : "active"
  );

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setSelectedReason("");
    setExtraReason("");
    setReason("");
  };

  const handleFinalConfirm = () => {
    const finalReason = extraReason.trim()
      ? `${selectedReason} - ${extraReason.trim()}`
      : selectedReason;
    onStatusChange(user.email, pendingStatus, finalReason);
    setShowConfirmModal(false);
    setSelectedReason("");
    setExtraReason("");
    setReason("");
  };

  return (
    <div className="flex justify-end relative">
      {/* Dropdown hành động */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-8 w-8 p-0 flex items-center justify-center rounded-md bg-white border border-gray-200 shadow hover:bg-gray-100 transition">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="z-50 bg-white shadow-xl border border-gray-200 rounded-xl min-w-[180px] py-2"
        >
          <DropdownMenuLabel className="font-semibold text-gray-700">
            Thao tác
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => onView(user)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg"
          >
            <Eye className="h-4 w-4 text-blue-500" /> Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${user.isActive
              ? "text-red-600 hover:bg-red-50"
              : "text-green-600 hover:bg-green-50"
              }`}
            onClick={() => {
              setPendingStatus(
                user.isActive ? "inactive" : "active"
              );
              setShowReasonDropdown(true);
            }}
          >
            {user.isActive ? (
              <Ban className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            {user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dropdown chọn lý do + Textarea (overlay fixed) */}
      {showReasonDropdown && (
        <>
          {/* Overlay nền */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowReasonDropdown(false)}
          />

          {/* Form chính */}
          <div className="fixed z-50 w-72 bg-white border border-gray-200 shadow-2xl rounded-xl p-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[80vh] overflow-y-auto animate-fade-in">
            <span className="text-sm font-semibold text-gray-700">
              Chọn lý do chính cho
              <span className="text-blue-600">{user.name}</span>:
            </span>
            <ul className="mt-2 space-y-1">
              {REASONS.map((item) => (
                <li
                  key={item.label}
                  className={`flex items-center cursor-pointer p-2 rounded-lg transition-all ${selectedReason === item.label
                    ? "bg-blue-50 font-semibold border border-blue-300"
                    : "hover:bg-gray-100"
                    }`}
                  onClick={() => setSelectedReason(item.label)}
                >
                  {item.icon}
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
                onClick={() => setShowReasonDropdown(false)}
                className="rounded-lg"
              >
                Hủy
              </Button>
              <Button
                onClick={() => {
                  const finalReason = extraReason.trim()
                    ? `${selectedReason} - ${extraReason.trim()}`
                    : selectedReason;
                  setReason(finalReason);
                  setShowReasonDropdown(false);
                  setShowConfirmModal(true);
                }}
                disabled={!selectedReason}
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg shadow-lg flex items-center gap-2 px-5 py-2 font-semibold transition-all"
              >
                <CheckCircle className="w-5 h-5" /> Tiếp theo
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Modal xác nhận */}
      <Dialog
        open={showConfirmModal}
        onOpenChange={(open) => !open && handleCancelConfirm()}
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
            Bạn có chắc chắn muốn
            <span className="font-semibold">
              {pendingStatus === "inactive" ? "Vô hiệu hóa" : "Kích hoạt"}
            </span>
            cho user
            <span className="font-semibold text-blue-600">{user.name}</span>?
            <div className="mt-2">
              <span className="font-semibold">Lý do:</span>
              <span className="italic">{reason}</span>
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleCancelConfirm}
              className="rounded-lg"
            >
              Hủy
            </Button>
            <Button
              onClick={handleFinalConfirm}
              className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-lg shadow-lg flex items-center gap-2 px-5 py-2 font-semibold transition-all"
            >
              <CheckCircle className="w-5 h-5" /> Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
