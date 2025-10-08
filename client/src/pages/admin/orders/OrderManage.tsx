import { useCallback, useState, useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    type SortingState,
} from "@tanstack/react-table";

import type { Order } from "@/types/orderType";
import { getOrderColumns } from "./components/OrderColumns";
import OrderTableHeader from "./components/OrderTableHeader";
import OrderTable from "./components/OrderTable";
import OrderTablePagination from "./components/OrderTablePagination";
import { OrderDetailDialog } from "./components/OrderDetailDialog";
import { useOrders } from "@/hooks/useOrders";

export default function OrderManage() {
    const [globalFilter, setGlobalFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Use orders hook to fetch data
    const { ordersQuery } = useOrders();
    const {
        data: ordersData = [],
        isLoading,
        error,
        refetch
    } = ordersQuery;

    // Filtered orders based on filters
    const filteredOrders = useMemo(() => {
        if (!Array.isArray(ordersData)) return [];
        return ordersData.filter(order => {
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
            const matchesPaymentStatus = paymentStatusFilter === 'all' || order.payment.status === paymentStatusFilter;
            return matchesStatus && matchesPaymentStatus;
        });
    }, [ordersData, statusFilter, paymentStatusFilter]);

    // Calculate stats
    const totalOrders = useMemo(() => ordersData.length, [ordersData]);
    const pendingCount = useMemo(() => ordersData.filter(order => order.status === 'pending').length, [ordersData]);
    const confirmedCount = useMemo(() => ordersData.filter(order => order.status === 'confirmed').length, [ordersData]);
    const shippingCount = useMemo(() => ordersData.filter(order => order.status === 'shipping').length, [ordersData]);
    const deliveredCount = useMemo(() => ordersData.filter(order => order.status === 'delivered').length, [ordersData]);

    // Handle refresh
    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    // Handle status change - Disabled for GHN orders
    const handleStatusChange = useCallback(
        (orderId: string, newStatus: Order['status'], reason?: string) => {
            console.log('GHN orders cannot be modified:', { orderId, newStatus, reason });
            // No action for GHN orders
        },
        []
    );

    const columns = getOrderColumns(
        (order: Order) => setSelectedOrder(order),
        handleStatusChange
    );

    const table = useReactTable({
        data: filteredOrders,
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
                        Có lỗi xảy ra khi tải dữ liệu đơn hàng
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

    const isProcessing = false; // No processing for GHN orders

    return (
        <div className="w-full h-full flex flex-col overflow-hidden relative">
            <div className="p-6 bg-gray-50 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
            <OrderTableHeader
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                paymentStatusFilter={paymentStatusFilter}
                setPaymentStatusFilter={setPaymentStatusFilter}
                onRefresh={handleRefresh}
                isLoading={isLoading || isProcessing}
                totalOrders={totalOrders}
                pendingCount={pendingCount}
                confirmedCount={confirmedCount}
                shippingCount={shippingCount}
                deliveredCount={deliveredCount}
            />

            {/* Loading overlay */}
            {(isLoading || isProcessing) && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-xl">
                    <div className="flex flex-col items-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-gray-700 font-medium">
                            {isProcessing ? "Đang xử lý..." : "Đang tải đơn hàng..."}
                        </span>
                    </div>
                </div>
            )}

            <div className={`flex-1 flex flex-col ${isLoading || isProcessing ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="flex-1">
                    <OrderTable table={table} columns={columns} />
                </div>
                <OrderTablePagination
                    table={table}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                />
            </div>

            {/* Order Detail Dialog */}
            <OrderDetailDialog
                order={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
            </div>
        </div>
    );
}