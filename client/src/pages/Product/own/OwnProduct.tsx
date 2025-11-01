import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FiSearch,
    FiGrid,
    FiList,
    FiPlus,
    FiRefreshCw
} from "react-icons/fi";

import type { Product } from "@/types/productType";
import { ProductListItem } from "./components/ProductListItem";
import { ProductCard } from "./components/ProductCard";
import { userServices } from "@/services/userServices";
import { useNavigate } from "react-router-dom";

export default function OwnProduct() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(8);
    const [totalItems, setTotalItems] = useState(0);
    // Removed unused productToDelete state
    const navigate = useNavigate();
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const params: Record<string, unknown> = { page, limit };
                if (selectedStatus && selectedStatus !== "all") params.status = selectedStatus;
                if (selectedCategory && selectedCategory !== "all") params.category = selectedCategory;
                if (sortBy) params.sort = sortBy;
                if (searchTerm) params.q = searchTerm;

                const data = await userServices.fetchOwnedProducts(params);
                // Expecting API to return { products: [], total: number, page, limit }
                setProducts(data.products || []);
                setFilteredProducts(data.products || []);
                setTotalItems(data.total || data.totalItems || data.meta?.total || 0);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [page, limit, selectedStatus, selectedCategory, sortBy, searchTerm]);

    // When filters, search, sort or page size change, reset to first page to avoid empty pages
    useEffect(() => {
        setPage(1);
    }, [selectedStatus, selectedCategory, sortBy, searchTerm, limit]);

    // Client-side filtering & sorting as a fallback when backend doesn't fully apply filters/sort
    useEffect(() => {
        let filtered = products.slice();

        // Status filter (client-side)
        if (selectedStatus && selectedStatus !== "all") {
            filtered = filtered.filter(p => p.status === selectedStatus);
        }

        // Category filter (client-side)
        if (selectedCategory && selectedCategory !== "all") {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Search filter
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            filtered = filtered.filter(product =>
                (product.title || "").toLowerCase().includes(q) ||
                (product.description || "").toLowerCase().includes(q) ||
                (product.brand || "").toLowerCase().includes(q)
            );
        }

        // Client-side sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case "price-high":
                    return (b.price || 0) - (a.price || 0);
                case "price-low":
                    return (a.price || 0) - (b.price || 0);
                default:
                    return 0;
            }
        });

        setFilteredProducts(filtered);
    }, [products, searchTerm, selectedStatus, selectedCategory, sortBy]);

    const handleEditProduct = (product: Product) => {
        console.log("Edit product:", product._id);
    };

    // Note: delete/toggle actions are not exposed in the owner list per current UX.

    const handleViewProduct = (product: Product) => {
        console.log("View product:", product._id);
        // Navigate to product detail page
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Tin đăng của tôi
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Quản lý và theo dõi các sản phẩm bạn đã đăng bán
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-gray-200 hover:bg-gray-50"
                        >
                            <FiRefreshCw className="w-4 h-4" />
                            Làm mới
                        </Button>

                        <Button
                            size="sm"
                            className="gap-2 bg-gray-900 hover:bg-gray-800 text-white shadow-lg"
                            onClick={() => navigate("/articles/create")}
                        >
                            <FiPlus className="w-4 h-4" />
                            Đăng tin mới
                        </Button>
                    </div>
                </div>

                {/* Filters & Search */}
                <Card className="border border-gray-200 shadow-lg bg-white">
                    <CardHeader className="border-b border-gray-100">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <CardTitle className="text-lg text-gray-900">
                                Bộ lọc và tìm kiếm
                            </CardTitle>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant={viewMode === "grid" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setViewMode("grid")}
                                    className={viewMode === "grid" ? "bg-gray-900 text-white" : ""}
                                >
                                    <FiGrid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setViewMode("list")}
                                    className={viewMode === "list" ? "bg-gray-900 text-white" : ""}
                                >
                                    <FiList className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Search */}
                            <div className="lg:col-span-2 relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                                />
                            </div>

                            {/* Status Filter */}
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="border-gray-200 focus:border-gray-900 focus:ring-gray-900">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="active">Đang hiển thị</SelectItem>
                                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                                    <SelectItem value="inactive">Tạm ẩn</SelectItem>
                                    <SelectItem value="rejected">Bị từ chối</SelectItem>
                                    <SelectItem value="sold">Đã bán</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Category Filter */}
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="border-gray-200 focus:border-gray-900 focus:ring-gray-900">
                                    <SelectValue placeholder="Danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                                    <SelectItem value="vehicle">Xe điện</SelectItem>
                                    <SelectItem value="battery">Pin xe điện</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Sort */}
                            <Select value={sortBy} onValueChange={setSortBy} >
                                <SelectTrigger className="border-gray-200 focus:border-gray-900 focus:ring-gray-900">
                                    <SelectValue placeholder="Sắp xếp" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Mới nhất</SelectItem>
                                    <SelectItem value="oldest">Cũ nhất</SelectItem>
                                    <SelectItem value="price-high">Giá cao nhất</SelectItem>
                                    <SelectItem value="price-low">Giá thấp nhất</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Products List */}
                <Card className="border border-gray-200 shadow-lg bg-white">
                    <CardHeader className="border-b border-gray-100">
                        <CardTitle className="text-lg text-gray-900">
                            Danh sách sản phẩm ({totalItems > 0 ? totalItems : filteredProducts.length})
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <FiRefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                                <span className="ml-2 text-gray-600">Đang tải...</span>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiPlus className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Chưa có sản phẩm nào
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Bạn chưa đăng tin bán nào. Hãy bắt đầu đăng tin đầu tiên!
                                </p>
                                <Button
                                    onClick={() => navigate("/articles/create")}
                                    className="bg-gray-900 hover:bg-gray-800 text-white"
                                >
                                    <FiPlus className="w-4 h-4 mr-2" />
                                    Đăng tin ngay
                                </Button>
                            </div>
                        ) : (
                            <div className="p-6">
                                {viewMode === "grid" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {filteredProducts.map((product) => (
                                            <ProductCard
                                                key={product._id}
                                                product={product}
                                                onEdit={handleEditProduct}
                                                onView={handleViewProduct}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredProducts.map((product) => (
                                            <ProductListItem
                                                key={product._id}
                                                product={product}
                                                onEdit={handleEditProduct}
                                                onView={handleViewProduct}
                                            />
                                        ))}
                                    </div>
                                )}
                                {/* Pagination */}
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Hiển thị {Math.min((page - 1) * limit + 1, totalItems || 0)} - {Math.min(page * limit, totalItems || 0)} trên {totalItems}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                                            <SelectTrigger className="w-28 border-gray-200 focus:border-gray-900 focus:ring-gray-900">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="6">6 / trang</SelectItem>
                                                <SelectItem value="12">12 / trang</SelectItem>
                                                <SelectItem value="24">24 / trang</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))}>
                                                Trước
                                            </Button>

                                            <div className="px-3 py-1 border rounded text-sm text-gray-700">
                                                {page} / {Math.max(1, Math.ceil((totalItems || 0) / limit))}
                                            </div>

                                            <Button size="sm" variant="outline" disabled={page >= Math.max(1, Math.ceil((totalItems || 0) / limit))} onClick={() => setPage(Math.min(Math.max(1, Math.ceil((totalItems || 0) / limit)), page + 1))}>
                                                Sau
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}