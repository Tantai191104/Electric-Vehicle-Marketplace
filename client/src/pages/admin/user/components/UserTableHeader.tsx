import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw } from "lucide-react";

interface Props {
  globalFilter: string;
  setGlobalFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function UserTableHeader({
  globalFilter,
  setGlobalFilter,
  statusFilter,
  setStatusFilter,
  onRefresh,
  isLoading,
}: Props) {
  return (
    <div className="mb-6">
      {/* Header with title and actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h2>
          <p className="text-gray-600 mt-1">
            Quản lý thông tin và trạng thái người dùng trên nền tảng
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
          <Input
            placeholder="Tìm kiếm theo tên, email..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full sm:w-80"
          />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Bị vô hiệu hóa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(globalFilter !== "" || statusFilter !== "all") && (
          <Button
            variant="outline"
            onClick={() => {
              setGlobalFilter("");
              setStatusFilter("all");
            }}
            className="w-full sm:w-auto"
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
}
