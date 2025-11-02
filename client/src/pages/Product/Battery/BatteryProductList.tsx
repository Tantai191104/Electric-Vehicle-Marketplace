// components/BatteryProductList.tsx
import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import BatteryCard from "./components/BatteryCard";
import { useProducts } from "@/hooks/useProduct";
import { BiErrorCircle } from "react-icons/bi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import type { Product } from "@/types/productType";

const PAGE_SIZE = 12;

const BatteryProductList: React.FC = () => {
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<string>("newest");

    // Fetch products với React Query
    const { data, isLoading, error } = useProducts({
        page,
        limit: PAGE_SIZE,
        category: "battery"
    });

    const totalPages = Math.ceil((data?.pagination.total || 0) / PAGE_SIZE);

    // Sort products
    const sortedProducts = React.useMemo(() => {
        const products = data?.products || [];
        const result = [...products];

        // Sort
        switch (sortBy) {
            case "priceAsc":
                result.sort((a, b) => a.price - b.price);
                break;
            case "priceDesc":
                result.sort((a, b) => b.price - a.price);
                break;
            case "newest":
                result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                break;
            default:
                break;
        }

        return result;
    }, [data?.products, sortBy]);

    // Loading state
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto mt-[180px] px-4 md:px-0">
                <div className="text-center py-12">
                    <AiOutlineLoading3Quarters className="w-8 h-8 mx-auto mb-4 text-blue-500 animate-spin" />
                    <p className="text-gray-600">Đang tải danh sách pin...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="max-w-7xl mx-auto mt-[180px] px-4 md:px-0">
                <div className="text-center py-12">
                    <BiErrorCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải dữ liệu</h3>
                    <p className="text-gray-600 mb-4">Có lỗi xảy ra khi tải danh sách pin</p>
                    <Button onClick={() => window.location.reload()} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                        Thử lại
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto mt-[180px] px-4 md:px-8 py-14">
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Pin xe điện</h1>
                        <p className="text-sm text-gray-600">
                            Hiển thị {sortedProducts.length} tin đăng (Trang {page}/{totalPages})
                        </p>
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-52 min-w-[200px] flex-shrink-0 border-gray-300">
                            <SelectValue placeholder="Sắp xếp theo" />
                        </SelectTrigger>
                        <SelectContent position="popper" side="bottom" align="start">
                            <SelectItem value="newest">Mới nhất</SelectItem>
                            <SelectItem value="priceAsc">Giá thấp đến cao</SelectItem>
                            <SelectItem value="priceDesc">Giá cao đến thấp</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedProducts.length === 0 ? (
                    <div className="col-span-full text-center text-gray-400 py-16">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <BiErrorCircle className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có tin đăng nào</h3>
                        <p className="text-gray-600">Hãy quay lại sau để xem các tin đăng mới</p>
                    </div>
                ) : (
                    sortedProducts.map((product: Product) => <BatteryCard key={product._id} battery={product} />)
                )}
            </div>

            {totalPages > 1 && (
                <Pagination className="mt-10">
                    <PaginationContent>
                        {[...Array(totalPages)].map((_, idx) => (
                            <PaginationItem key={idx}>
                                <PaginationLink
                                    isActive={page === idx + 1}
                                    onClick={() => setPage(idx + 1)}
                                    className="cursor-pointer"
                                >
                                    {idx + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
};

export default BatteryProductList;
