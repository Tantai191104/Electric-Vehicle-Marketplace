import { useState } from "react";
import { Ban, CheckCircle, Eye, MoreHorizontal, ShieldAlert } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { User } from "@/types/authType";
import { ViolationDialog } from "./ViolationDialog";
import { StatusChangeDialog } from "./StatusChangeDialog";

interface UserActionsProps {
  user: User;
  onView: (user: User) => void;
  onStatusChange: (
    userId: string,
    newStatus: "inactive" | "active",
    reason: string
  ) => void;
}

export function UserActions({
  user,
  onView,
  onStatusChange,
}: UserActionsProps) {
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showViolationDialog, setShowViolationDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"active" | "inactive">(
    user.isActive ? "inactive" : "active"
  );

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
              setPendingStatus(user.isActive ? "inactive" : "active");
              setShowStatusDialog(true);
            }}
          >
            {user.isActive ? (
              <Ban className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            {user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowViolationDialog(true)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 rounded-lg text-red-600"
          >
            <ShieldAlert className="h-4 w-4 text-red-500" /> Tạo vi phạm
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Change Dialog */}
      <StatusChangeDialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        user={user}
        pendingStatus={pendingStatus}
        onConfirm={onStatusChange}
      />

      {/* Violation Dialog */}
      <ViolationDialog
        isOpen={showViolationDialog}
        onClose={() => setShowViolationDialog(false)}
        user={user}
      />
    </div>
  );
}
