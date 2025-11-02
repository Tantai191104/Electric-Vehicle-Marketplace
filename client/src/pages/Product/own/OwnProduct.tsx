import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    FiSearch,
    FiGrid,
    FiList,
    FiPlus,
    FiRefreshCw,
} from "react-icons/fi";

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

import type { Product } from "@/types/productType";
import { ProductDetailModal, ProductEditModal } from "./components/ProductModals";
import { ProductListItem } from "./components/ProductListItem";
import { ProductCard } from "./components/ProductCard";
import { userServices } from "@/services/userServices";
import { productServices } from "@/services/productServices";

export default function MyProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [page, setPage] = useState(1);
    const [limit] = useState(8);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"detail" | "edit">("detail");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Product>>({});
    const [editLoading, setEditLoading] = useState(false);

    const navigate = useNavigate();

    /** 🔹 Load sản phẩm từ API */
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const params: Record<string, unknown> = { page, limit };

                if (selectedStatus !== "all") params.status = selectedStatus;
                if (selectedCategory !== "all") params.category = selectedCategory;
                if (sortBy) params.sort = sortBy;
                if (searchTerm) params.q = searchTerm;

                const data = await userServices.fetchOwnedProducts(params);

                setProducts(data.products || []);
                setFilteredProducts(data.products || []);
                // Removed setTotalItems as it's unused
            } catch (err) {
                console.error(err);
                toast.error("Không thể tải danh sách sản phẩm");
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, [page, limit, selectedStatus, selectedCategory, sortBy, searchTerm]);

    /** Reset về trang 1 khi filter thay đổi */
    useEffect(() => {
        setPage(1);
    }, [selectedStatus, selectedCategory, sortBy, searchTerm, limit]);

    /** Lọc và sắp xếp client-side */
    useEffect(() => {
        let filtered = [...products];

        if (selectedStatus !== "all") filtered = filtered.filter(p => p.status === selectedStatus);
        if (selectedCategory !== "all") filtered = filtered.filter(p => p.category === selectedCategory);

        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            filtered = filtered.filter(
                p =>
                    p.title?.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q) ||
                    p.brand?.toLowerCase().includes(q)
            );
        }

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

    /** 🔹 Xem chi tiết */
    const handleViewProduct = async (product: Product) => {
        setModalMode("detail");
        setModalOpen(true);
        setDetailLoading(true);
        try {
            const response = await productServices.fetchProductById(product._id);
            console.log("Product detail response:", response);
            // Response có cấu trúc { product: {...} }
            const detail = response?.product || response;
            setSelectedProduct(detail || product);
        } catch (error) {
            console.error("Error fetching product detail:", error);
            toast.error("Không thể tải chi tiết sản phẩm");
            setSelectedProduct(product);
        } finally {
            setDetailLoading(false);
        }
    };

    /** 🔹 Chỉnh sửa */
    const handleEditProduct = async (product: Product) => {
        setModalMode("edit");
        setModalOpen(true);
        setDetailLoading(true);
        try {
            const response = await productServices.fetchProductById(product._id);
            console.log("Product edit response:", response);
            // Response có cấu trúc { product: {...} }
            const prod = response?.product || response;
            setSelectedProduct(prod);
            setEditForm({
                title: prod.title,
                price: prod.price,
                description: prod.description,
                category: prod.category,
                condition: prod.condition,
            });
        } catch (error) {
            console.error("Error fetching product for edit:", error);
            toast.error("Không thể tải chi tiết sản phẩm");
            setSelectedProduct(product);
            setEditForm({
                title: product.title,
                price: product.price,
                description: product.description,
                category: product.category,
                condition: product.condition,
            });
        } finally {
            setDetailLoading(false);
        }
    };

    /** 🔹 Submit chỉnh sửa */
    const handleEditSubmit = async () => {
        if (!selectedProduct) return;
        setEditLoading(true);
        try {
            await productServices.updateProduct(selectedProduct._id, editForm);
            toast.success("Cập nhật sản phẩm thành công!");
            setModalOpen(false);
            setPage(1); // reload
        } catch {
            toast.error("Cập nhật sản phẩm thất bại");
        } finally {
            setEditLoading(false);
        }
    };

    /** 🔹 Làm mới */
    const handleRefresh = () => {
        setPage(1);
        setSearchTerm("");
        setSelectedCategory("all");
        setSelectedStatus("all");
        toast.info("Danh sách đã được làm mới");
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Tin đăng của tôi</h1>
                            <p className="text-gray-600 mt-1">Quản lý và theo dõi các sản phẩm bạn đã đăng bán</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
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
                                <CardTitle className="text-lg text-gray-900">Bộ lọc và tìm kiếm</CardTitle>

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
                                <Select value={sortBy} onValueChange={setSortBy}>
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

                    {/* Hiển thị danh sách sản phẩm */}
                    <div>
                        {loading ? (
                            <p className="text-center text-gray-500 py-6">Đang tải...</p>
                        ) : filteredProducts.length === 0 ? (
                            <p className="text-center text-gray-500 py-6">Không có sản phẩm nào</p>
                        ) : viewMode === "grid" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredProducts.map((p) => (
                                    <ProductCard
                                        key={p._id}
                                        product={p}
                                        onView={() => handleViewProduct(p)}
                                        onEdit={() => handleEditProduct(p)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredProducts.map((p) => (
                                    <ProductListItem
                                        key={p._id}
                                        product={p}
                                        onView={() => handleViewProduct(p)}
                                        onEdit={() => handleEditProduct(p)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {modalMode === "detail" ? (
                <ProductDetailModal
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    product={selectedProduct}
                    loading={detailLoading}
                />
            ) : (
                <ProductEditModal
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    product={selectedProduct}
                    loading={detailLoading}
                    editForm={editForm}
                    setEditForm={setEditForm}
                    editLoading={editLoading}
                    onSubmit={handleEditSubmit}
                />
            )}
        </>
    );
}
