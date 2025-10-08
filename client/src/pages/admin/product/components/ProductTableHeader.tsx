import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FiFilter } from "react-icons/fi";
import { RefreshCw } from "lucide-react";

interface Props {
    globalFilter: string;
    setGlobalFilter: (val: string) => void;
    categoryFilter: string;
    setCategoryFilter: (val: string) => void;
    statusFilter: string;
    setStatusFilter: (val: string) => void;
    conditionFilter: string;
    setConditionFilter: (val: string) => void;
    onAddProduct?: () => void;
    onRefresh?: () => void;
    isLoading?: boolean;
    totalProducts?: number;
    pendingCount?: number;
}

export default function ProductTableHeader({
    globalFilter,
    setGlobalFilter,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    conditionFilter,
    setConditionFilter,
    onRefresh,
    isLoading = false,
    totalProducts = 0,
    pendingCount = 0,
}: Props) {
    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm chờ duyệt</h2>
                        <p className="text-sm text-gray-600">
                            Xem xét và phê duyệt các sản phẩm được đăng bởi người dùng
                        </p>
                    </div>
                    {pendingCount > 0 && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {pendingCount} chờ duyệt
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {onRefresh && (
                        <Button
                            onClick={onRefresh}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                            Làm mới
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiFilter className="w-4 h-4" />
                    <span>Lọc:</span>
                </div>

                <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="w-full sm:w-64"
                />

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="vehicle">Xe điện</SelectItem>
                        <SelectItem value="battery">Pin xe điện</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Tình trạng" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="new">Mới</SelectItem>
                        <SelectItem value="used">Đã sử dụng</SelectItem>
                        <SelectItem value="refurbished">Tân trang</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="pending">Chờ duyệt</SelectItem>
                        <SelectItem value="active">Đã duyệt</SelectItem>
                        <SelectItem value="inactive">Từ chối</SelectItem>
                        <SelectItem value="sold">Đã bán</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    onClick={() => {
                        setGlobalFilter("");
                        setCategoryFilter("all");
                        setStatusFilter("all");
                        setConditionFilter("all");
                    }}
                >
                    Xóa bộ lọc
                </Button>
            </div>

            {/* Stats */}
            {totalProducts > 0 && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Tổng: {totalProducts} sản phẩm</span>
                    {pendingCount > 0 && (
                        <span className="text-yellow-600">
                            • {pendingCount} đang chờ duyệt
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}