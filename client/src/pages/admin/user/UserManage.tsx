import { useCallback, useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { toast } from "sonner";

import { getUserColumns } from "./components/UserColumns";
import UserTableHeader from "./components/UserTableHeader";
import UserTable from "./components/UserTable";
import UserTablePagination from "./components/UserTablePagination";
import { UserDetailDialog } from "./components/UserDetailDialog";
import type { User } from "@/types/authType";
import { useAdmin } from "@/hooks/useAdmin";

export default function UserManage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Lấy dữ liệu user từ hook useAdmin
  const { usersQuery } = useAdmin();
  const {
    data: userData = [],
    isLoading,
    refetch,
    error
  } = usersQuery;

  // Lọc chỉ user thường, loại bỏ admin
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(userData)) return [];
    return userData.filter(user => {
      const isRegularUser = user.role === 'user';
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'inactive' && !user.isActive);
      return isRegularUser && matchesStatus;
    });
  }, [userData, statusFilter]);
  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Callback ban user
  const handleBanUser = useCallback(
    (email: string, status: "inactive" | "active", reason: string) => {
      console.log(`User: ${email}, New Status: ${status}, Reason: ${reason}`);
      toast.success(`Đã cập nhật trạng thái người dùng: ${email}`, {
        description: `Trạng thái mới: ${status === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'}`,
        duration: 3000,
      });
      refetch();
    },
    [refetch]
  );

  const columns = getUserColumns(
    (user) => setSelectedUser(user),
    handleBanUser
  );

  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination: { pageIndex, pageSize }
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const nextState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(nextState.pageIndex);
      setPageSize(nextState.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
  });

  // Handle error state
  if (error) {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden">
        <div className="p-6 bg-gray-50 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Có lỗi xảy ra khi tải dữ liệu người dùng
          </h2>
          <p className="text-gray-600 mb-4 text-center">
            {error?.message || "Vui lòng thử lại sau"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="p-6 bg-gray-50 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
      <UserTableHeader
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-xl">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 font-medium">Đang tải người dùng...</span>
          </div>
        </div>
      )}

      <div className={`flex-1 flex flex-col ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="flex-1">
          <UserTable table={table} columns={columns} />
        </div>
        <UserTablePagination
          table={table}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      </div>

      <UserDetailDialog
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
      </div>
    </div>
  );
}

