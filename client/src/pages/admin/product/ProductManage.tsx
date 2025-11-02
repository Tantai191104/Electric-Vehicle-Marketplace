import { useCallback, useState, useMemo } from "react";
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
import { useAdmin } from "@/hooks/useAdmin";
import { adminServices } from "@/services/adminServices";
import type { AxiosError } from "axios";
import { RejectDialog } from "@/pages/admin/product/components/RejectDialog";
import { ConfirmDialog } from "./components/ConfirmDialog";
export default function ProductManage() {
    const [globalFilter, setGlobalFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("pending");
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

    // Use admin hook to fetch all products
    const { productsQuery } = useAdmin();
    const {
        data: productsData = [],
        isLoading,
        refetch,
        error
    } = productsQuery;

    // Mutation for approving product
    const approveMutation = useMutation({
        mutationFn: adminServices.approveProduct,
        onSuccess: (_, productId) => {
            toast.success("✅ Sản phẩm đã được phê duyệt thành công!", {
                description: "Người bán sẽ nhận được thông báo về việc phê duyệt",
                duration: 4000,
            });
            queryClient.invalidateQueries({ queryKey: ["products"] });
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
            queryClient.invalidateQueries({ queryKey: ["products"] });
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

    // Calculate stats
    const pendingCount = useMemo(() => {
        if (!Array.isArray(productsData)) return 0;
        return productsData.filter((product) => product.status === "pending").length;
    }, [productsData]);

    // Filter data based on filters
    const filteredData = useMemo(() => {
        if (!Array.isArray(productsData)) return [];
        return productsData.filter((product) => {
            const matchesCategory =
                categoryFilter === "all" || product.category === categoryFilter;
            const matchesStatus =
                statusFilter === "all" || product.status === statusFilter;
            const matchesCondition =
                conditionFilter === "all" || product.condition === conditionFilter;
            return matchesCategory && matchesStatus && matchesCondition;
        });
    }, [productsData, categoryFilter, statusFilter, conditionFilter]);

    const handleToggleFeatured = useCallback(
        (productId: string, featured: boolean) => {
            console.log(`Product: ${productId}, Featured: ${featured}`);
            // TODO: Add mutation for toggling featured status
            refetch();
        },
        [refetch]
    );
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
        handleToggleFeatured
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
                    totalProducts={productsData.length}
                    pendingCount={pendingCount}
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
                    <ProductTablePagination
                        table={table}
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                    />
                </div>

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