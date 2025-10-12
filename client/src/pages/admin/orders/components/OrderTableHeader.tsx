import { RefreshCw, Search, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface OrderTableHeaderProps {
    globalFilter: string;
    setGlobalFilter: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    shippingMethodFilter: string;
    setShippingMethodFilter: (value: string) => void;
    onRefresh: () => void;
    isLoading: boolean;
}

export default function OrderTableHeader({
    globalFilter,
    setGlobalFilter,
    statusFilter,
    setStatusFilter,
    shippingMethodFilter,
    setShippingMethodFilter,
    onRefresh,
    isLoading,
}: OrderTableHeaderProps) {
    return (
        <div className="space-y-6 mb-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
                    <p className="text-gray-600 mt-1">
                        Theo dõi đơn hàng Giao Hàng Nhanh (GHN) - Chỉ xem thông tin
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                        <Info className="w-3 h-3" />
                        <span>Đơn hàng được quản lý bởi GHN</span>
                    </div>
                </div>
                <Button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    Làm mới
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Tìm kiếm mã đơn, sản phẩm, người mua..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-10 text-sm"
                        />
                    </div>

                    {/* Shipping Method */}
                    <div className="w-48 flex-shrink-0">
                        <Select value={shippingMethodFilter} onValueChange={setShippingMethodFilter}>
                            <SelectTrigger className="w-full text-sm">
                                <SelectValue placeholder="Phương thức vận chuyển" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả phương thức</SelectItem>
                                <SelectItem value="in-person">Nhận tại bãi xe</SelectItem>
                                <SelectItem value="ghn">GHN</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status */}
                    <div className="w-44 flex-shrink-0">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full text-sm">
                                <SelectValue placeholder="Trạng thái đơn hàng" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="pending">Chờ xác nhận</SelectItem>
                                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                                <SelectItem value="shipping">Đang giao</SelectItem>
                                <SelectItem value="delivered">Đã giao</SelectItem>
                                <SelectItem value="cancelled">Đã hủy</SelectItem>
                                <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
}
