import { useCallback, useState, useMemo, useEffect } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    type SortingState,
} from "@tanstack/react-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getProductColumns } from "./components/ProductColumns";
import ProductTableHeader from "./components/ProductTableHeader";
import { ProductDetailDialog } from "./components/ProductDetailDialog";
import type { Product } from "@/types/productType";
import ProductTablePagination from "./components/ProductTablePagination";
import ProductTable from "./components/ProductTable";
import { useQuery } from "@tanstack/react-query";
import { adminServices } from "@/services/adminServices";
import type { AxiosError } from "axios";
import { RejectDialog } from "@/pages/admin/product/components/RejectDialog";
import { ConfirmDialog } from "./components/ConfirmDialog";
export default function ProductManage() {
    const [globalFilter, setGlobalFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [conditionFilter, setConditionFilter] = useState("all");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Dialog states
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [productToApprove, setProductToApprove] = useState<string | null>(null);
    const [productToReject, setProductToReject] = useState<Product | null>(null);

    const queryClient = useQueryClient();

    // Fetch products based on status filter
    const productsQuery = useQuery({
        queryKey: ["admin-products", statusFilter],
        queryFn: () => adminServices.fetchAllProducts(statusFilter === "all" ? undefined : statusFilter),
        staleTime: 30000, // Cache for 30 seconds
    });

    const {
        data: productsResponse,
        isLoading,
        refetch,
        error
    } = productsQuery;

    const productsData = useMemo(() => {
        return productsResponse?.data || [];
    }, [productsResponse?.data]);
    // Total from server is the total after status filter
    // But we need to show total after all filters (status + category + condition)
    // So we'll use filteredData length for accurate count
    // But if we haven't filtered yet, use server total as estimate

    // Reset to first page when filters or sorting change
    useEffect(() => {
        setPageIndex(0);
    }, [statusFilter, categoryFilter, conditionFilter, sorting]);

    // Mutation for approving product
    const approveMutation = useMutation({
        mutationFn: adminServices.approveProduct,
        onSuccess: (_, productId) => {
            toast.success("Sản phẩm đã được phê duyệt thành công!", {
                description: "Người bán sẽ nhận được thông báo về việc phê duyệt",
                duration: 4000,
            });
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            refetch();
            // Close dialog if the approved product is currently selected
            if (selectedProduct?._id === productId) {
                setSelectedProduct(null);
            }
            setShowApproveDialog(false);
            setProductToApprove(null);
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error("❌ Có lỗi xảy ra khi phê duyệt sản phẩm", {
                description: error?.response?.data?.message || "Vui lòng thử lại sau",
                duration: 4000,
            });
            setShowApproveDialog(false);
            setProductToApprove(null);
        },
    });

    // Mutation for rejecting product
    const rejectMutation = useMutation({
        mutationFn: ({ productId, reason }: { productId: string; reason: string }) =>
            adminServices.rejectProduct(productId, reason),
        onSuccess: (_, { productId }) => {
            toast.success("🚫 Sản phẩm đã bị từ chối!", {
                description: "Người bán đã nhận được thông báo kèm lý do từ chối",
                duration: 4000,
            });
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            refetch();
            // Close dialog if the rejected product is currently selected
            if (selectedProduct?._id === productId) {
                setSelectedProduct(null);
            }
            setShowRejectDialog(false);
            setProductToReject(null);
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error("❌ Có lỗi xảy ra khi từ chối sản phẩm", {
                description: error?.response?.data?.message || "Vui lòng thử lại sau",
                duration: 4000,
            });
            setShowRejectDialog(false);
            setProductToReject(null);
        },
    });

    // Filter and sort data based on filters
    const filteredData = useMemo(() => {
        if (!Array.isArray(productsData)) return [];

        // Filter first
        const filtered = productsData.filter((product) => {
            // Category filter (client-side only)
            const matchesCategory =
                categoryFilter === "all" || product.category === categoryFilter;

            // Condition filter (client-side only)
            const matchesCondition =
                conditionFilter === "all" || product.condition === conditionFilter;

            return matchesCategory && matchesCondition;
        });

        // Sort: pending products first (sorted by newest), then other statuses
        return filtered.sort((a, b) => {
            // If both are pending, sort by createdAt (newest first)
            if (a.status === "pending" && b.status === "pending") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            // If only a is pending, a comes first
            if (a.status === "pending") return -1;
            // If only b is pending, b comes first
            if (b.status === "pending") return 1;
            // For other statuses, sort by createdAt (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [productsData, categoryFilter, conditionFilter]);
    const totalProductsFromServer = productsResponse?.pagination?.total || 0;
    const hasClientSideFilters = categoryFilter !== "all" || conditionFilter !== "all";

    const displayTotal = hasClientSideFilters
        ? filteredData.length  // Client-side filtered count (may be incomplete if server limited results)
        : (totalProductsFromServer > 0 ? totalProductsFromServer : filteredData.length); // Server total or fallback

    // Handle refresh
    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    // Handle approve product - show confirm dialog
    const handleApproveProduct = useCallback((productId: string) => {
        setProductToApprove(productId);
        setShowApproveDialog(true);
    }, []);

    // Handle reject product - show reject dialog
    const handleRejectProduct = useCallback((productId: string) => {
        const product = productsData.find(p => p._id === productId);
        if (product) {
            setProductToReject(product);
            setShowRejectDialog(true);
        }
    }, [productsData]);

    // Confirm approve
    const handleConfirmApprove = useCallback(() => {
        if (productToApprove) {
            approveMutation.mutate(productToApprove);
        }
    }, [productToApprove, approveMutation]);

    // Confirm reject
    const handleConfirmReject = useCallback((reason: string) => {
        if (productToReject) {
            rejectMutation.mutate({
                productId: productToReject._id,
                reason
            });
        }
    }, [productToReject, rejectMutation]);

    const columns = getProductColumns(
        (product) => setSelectedProduct(product),
        handleApproveProduct,
        handleRejectProduct
    );

    const table = useReactTable({
        data: filteredData,
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
                            Có lỗi xảy ra khi tải dữ liệu
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

    const isProcessing = approveMutation.isPending || rejectMutation.isPending;

    return (
        <div className="w-full h-full flex flex-col overflow-hidden relative">
            <div className="p-6 bg-gray-50 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
                <ProductTableHeader
                    globalFilter={globalFilter}
                    setGlobalFilter={setGlobalFilter}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    conditionFilter={conditionFilter}
                    setConditionFilter={setConditionFilter}
                    onRefresh={handleRefresh}
                    isLoading={isLoading || isProcessing}
                    totalProducts={displayTotal}
                />

                {/* Loading overlay */}
                {(isLoading || isProcessing) && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-xl">
                        <div className="flex flex-col items-center space-y-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="text-gray-700 font-medium">
                                {isProcessing ? "Đang xử lý..." : "Đang tải sản phẩm..."}
                            </span>
                        </div>
                    </div>
                )}

                <div className={`flex-1 flex flex-col ${isLoading || isProcessing ? "opacity-50 pointer-events-none" : ""}`}>
                    <div className="flex-1">
                        <ProductTable table={table} columns={columns} />
                    </div>
                </div>

                {/* Pagination outside of pointer-events-none div - always interactive */}
                <ProductTablePagination
                    table={table}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                />

                {/* Product Detail Dialog */}
                <ProductDetailDialog
                    product={selectedProduct}
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onApprove={handleApproveProduct}
                    onReject={handleRejectProduct}
                />

                {/* Approve Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={showApproveDialog}
                    onClose={() => {
                        setShowApproveDialog(false);
                        setProductToApprove(null);
                    }}
                    onConfirm={handleConfirmApprove}
                    title="Phê duyệt sản phẩm"
                    description="Bạn có chắc chắn muốn phê duyệt sản phẩm này? Sản phẩm sẽ được hiển thị công khai và người bán sẽ nhận được thông báo."
                    confirmText="Phê duyệt"
                    cancelText="Hủy"
                    variant="success"
                    isLoading={approveMutation.isPending}
                />

                {/* Reject Dialog */}
                <RejectDialog
                    isOpen={showRejectDialog}
                    onClose={() => {
                        setShowRejectDialog(false);
                        setProductToReject(null);
                    }}
                    onConfirm={handleConfirmReject}
                    product={productToReject}
                    isLoading={rejectMutation.isPending}
                />
            </div>
        </div>
    );
}