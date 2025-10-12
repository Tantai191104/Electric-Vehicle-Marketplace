// components/CarProductList.tsx
import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import FilterSidebar from "./components/FilterSidebar";
import CarCard from "./components/CarCard";
import { useProducts } from "@/hooks/useProduct";
import { BiErrorCircle } from "react-icons/bi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import type { Product } from "@/types/productType";

const PAGE_SIZE = 9;

const brands = ["VinFast", "Tesla", "KIA"];
const colors = ["Đen", "Trắng", "Xám"];
const types = ["SUV", "Sedan"];

const CarProductList: React.FC = () => {
    const [selectedBrand, setSelectedBrand] = useState<string[]>([]);
    const [selectedColor, setSelectedColor] = useState<string[]>([]);
    const [selectedType, setSelectedType] = useState<string[]>([]);
    const [minPrice, setMinPrice] = useState<number | "">("");
    const [maxPrice, setMaxPrice] = useState<number | "">("");
    const [page, setPage] = useState(1);

    // Fetch products với React Query
    const { data, isLoading, error } = useProducts({
        page,
        limit: PAGE_SIZE,
        category: "vehicle"
    });

    const products = data?.products || [];
    const totalPages = Math.ceil((data?.pagination.total || 0) / PAGE_SIZE);

    // Loading state
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto mt-[180px] px-4 md:px-0">
                <div className="text-center py-12">
                    <AiOutlineLoading3Quarters className="w-8 h-8 mx-auto mb-4 text-yellow-500 animate-spin" />
                    <p className="text-gray-600">Đang tải danh sách xe điện...</p>
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
                    <p className="text-gray-600 mb-4">Có lỗi xảy ra khi tải danh sách xe điện</p>
                    <Button onClick={() => window.location.reload()} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                        Thử lại
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto mt-[180px] px-4 md:px-0 py-14">
            <div className="flex flex-col md:flex-row gap-8">
                <FilterSidebar
                    brands={brands}
                    colors={colors}
                    types={types}
                    selectedBrand={selectedBrand}
                    setSelectedBrand={setSelectedBrand}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    minPrice={minPrice}
                    setMinPrice={setMinPrice}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                />

                <main className="flex-1">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Danh sách xe điện</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Hiển thị {products.length} xe điện (Trang {page}/{totalPages})
                            </p>
                        </div>
                        <Select>
                            <SelectTrigger className="w-52 min-w-[200px] flex-shrink-0">
                                <SelectValue placeholder="Sắp xếp theo" />
                            </SelectTrigger>
                            <SelectContent position="popper" side="bottom" align="start">
                                <SelectItem value="popular">Phổ biến</SelectItem>
                                <SelectItem value="priceAsc">Giá tăng dần</SelectItem>
                                <SelectItem value="priceDesc">Giá giảm dần</SelectItem>
                                <SelectItem value="newest">Mới nhất</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {products.length === 0 ? (
                            <div className="col-span-3 text-center text-gray-400 py-12">
                                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <BiErrorCircle className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy xe phù hợp</h3>
                                <p className="text-gray-600">Hãy thử điều chỉnh bộ lọc để tìm thêm sản phẩm</p>
                            </div>
                        ) : (
                            products.map((product: Product) => <CarCard key={product._id} car={product} />)
                        )}
                    </div>

                    {totalPages > 1 && (
                        <Pagination className="mt-8">
                            <PaginationContent>
                                {[...Array(totalPages)].map((_, idx) => (
                                    <PaginationItem key={idx}>
                                        <PaginationLink
                                            isActive={page === idx + 1}
                                            onClick={() => setPage(idx + 1)}
                                        >
                                            {idx + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                            </PaginationContent>
                        </Pagination>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CarProductList;
