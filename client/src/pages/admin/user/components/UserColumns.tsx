import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

import { UserActions } from "./UserActions.js";
import type { User } from "@/types/authType.js";

export const getUserColumns = (
  onViewUser: (user: User) => void,
  onStatusChange: (
    userId: string,
    newStatus: "inactive" | "active",
    reason: string
  ) => void
): ColumnDef<User>[] => [
    {
      accessorKey: "name",
      header: "Tên",
      cell: (info) => (
        <div className="font-semibold text-gray-800 truncate max-w-[160px]">
          {String(info.getValue())}
        </div>
      ),
      size: 160,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (info) => (
        <div className="text-gray-600 truncate max-w-[180px]">
          {String(info.getValue())}
        </div>
      ),
      size: 180,
    },
    {
      accessorKey: "phone",
      header: "SĐT",
      cell: (info) => (
        <div className="text-gray-600 font-medium truncate max-w-[140px]">
          {String(info.getValue())}
        </div>
      ),
      size: 140,
    },
    {
      accessorFn: (row: User) =>
        `${row.profile.address.houseNumber || ""}, ${row.profile.address.ward || ""}, ${row.profile.address.district || ""}, ${row.profile.address.province || ""}`,
      id: "address",
      header: "Địa chỉ",
      cell: (info) => (
        <div className="text-gray-600 truncate max-w-[200px]">
          {String(info.getValue()) || "-"}
        </div>
      ),
      size: 200,
    },

    {
      accessorKey: "role",
      header: "Vai trò",
      cell: ({ row }) => {
        const role = row.original.role;
        const getRoleColor = (role: string) => {
          switch (role) {
            case "staff":
              return "bg-blue-100 text-blue-800";
            case "admin":
              return "bg-purple-100 text-purple-800";
            default:
              return "bg-gray-100 text-gray-800";
          }
        };
        const getRoleText = (role: string) => {
          switch (role) {
            case "staff":
              return "Nhân viên";
            case "admin":
              return "Quản trị viên";
            case "user":
              return "Người dùng";
            default:
              return "Không xác định";
          }
        };
        return (
          <Badge
            variant="outline"
            className={`${getRoleColor(
              role
            )} border-0 px-2 py-1 text-sm rounded-full font-semibold`}
          >
            {getRoleText(role)}
          </Badge>
        );
      },
      size: 100,
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.original.isActive ? "active" : "inactive";
        const getStatusColor = (status: string) => {
          switch (status) {
            case "active":
              return "bg-green-100 text-green-800";
            case "inactive":
              return "bg-red-100 text-red-800";
            default:
              return "bg-gray-100 text-gray-800";
          }
        };
        const getStatusText = (status: string) => {
          switch (status) {
            case "active":
              return "Hoạt động";
            case "inactive":
              return "Vô hiệu hóa";
            default:
              return "Không xác định";
          }
        };
        return (
          <Badge
            variant="outline"
            className={`${getStatusColor(
              status
            )} border-0 px-2 py-1 text-sm rounded-full font-semibold`}
          >
            {getStatusText(status)}
          </Badge>
        );
      },
      size: 100,
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => (
        <UserActions
          user={row.original}
          onView={onViewUser}
          onStatusChange={onStatusChange}
        />
      ),
      size: 120,
    },
  ];
