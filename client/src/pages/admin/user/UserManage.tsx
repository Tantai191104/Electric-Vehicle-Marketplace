import { useCallback, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
} from "@tanstack/react-table";

import { getUserColumns } from "./components/UserColumns";
import UserTableHeader from "./components/UserTableHeader";
import UserTable from "./components/UserTable";
import UserTablePagination from "./components/UserTablePagination";
import { UserDetailDialog } from "./components/UserDetailDialog";
import type { User } from "@/types/authType";
import { useAdmin } from "@/hooks/useAdmin";

export default function UserManage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Lấy dữ liệu user từ hook useUsers
  const { data: userData = [], isLoading, refetch } = useAdmin().usersQuery;


  // Callback ban user
  const handleBanUser = useCallback(
    (email: string, status: "inactive" | "active", reason: string) => {
      console.log(`User: ${email}, New Status: ${status}, Reason: ${reason}`);
      refetch();
    },
    [refetch]
  );

  const columns = getUserColumns(
    (user) => setSelectedUser(user),
    handleBanUser
  );

  const table = useReactTable({
    data: userData,
    columns,
    state: { sorting, globalFilter, pagination: { pageIndex, pageSize } },
    onSortingChange: setSorting,
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

  return (
    <div className="w-full p-6 rounded-xl shadow-sm bg-gray-50 relative">
      <UserTableHeader
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-xl">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 font-medium">
              {isLoading ? "Đang xử lý..." : "Đang tải người dùng..."}
            </span>
          </div>
        </div>
      )}

      <div className={`${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
        <UserTable table={table} columns={columns} />
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
  );
}
