import React from "react";
import { useWishlist, useRemoveWishlist } from "@/hooks/useProduct";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiErrorCircle } from "react-icons/bi";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { MdFavorite } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/productType";
import WishlistCard from "./components/WishlistCard";
import { CarIcon } from "lucide-react";
const WishListPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: wishlistData, isLoading, error } = useWishlist();
    const removeWishlist = useRemoveWishlist();
    const products = wishlistData?.products || [];

    const handleRemove = (productId: string) => {
        removeWishlist.mutate(productId);
    };

    const handleView = (productId: string) => {
        navigate(`/product/${productId}`);
    };

    if (isLoading)
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
                <div className="max-w-7xl mx-auto pt-32 px-4 text-center">
                    <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AiOutlineLoading3Quarters className="w-8 h-8 text-yellow-500 animate-spin" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Đang tải dữ liệu</h2>
                        <p className="text-gray-500">Vui lòng chờ trong giây lát...</p>
                    </div>
                </div>
            </div>
        );

    if (error)
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
                <div className="max-w-7xl mx-auto pt-32 px-4 text-center">
                    <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BiErrorCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Oops! Có lỗi xảy ra
                        </h2>
                        <p className="text-gray-500 mb-6">Không thể tải danh sách yêu thích của bạn.</p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
                        >
                            Thử lại
                        </Button>
                    </div>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto pt-32 px-4 md:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
                            <MdFavorite className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Danh sách yêu thích
                        </h1>
                        <p className="text-gray-600 max-w-md mx-auto">
                            Những sản phẩm mà bạn đã lưu để xem lại sau
                        </p>
                    </div>

                    {products.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FiShoppingBag className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-700 font-medium">
                                        Tổng cộng: <span className="text-gray-900 font-semibold">{products.length}</span> sản phẩm
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Cập nhật mới nhất
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                {products.length === 0 ? (
                    <EmptyState navigate={navigate} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product: Product) => (
                            <WishlistCard
                                key={product._id}
                                product={product}
                                onRemove={() => handleRemove(product._id)}
                                onView={() => handleView(product._id)}
                                isRemoving={removeWishlist.isPending}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Empty State Component
const EmptyState: React.FC<{ navigate: (url: string) => void }> = ({ navigate }) => (
    <div className="text-center py-20">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 max-w-lg mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <FiHeart className="w-12 h-12 text-gray-400" />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Chưa có sản phẩm yêu thích
            </h2>

            <p className="text-gray-500 mb-8 leading-relaxed">
                Khám phá những sản phẩm tuyệt vời và thêm chúng vào danh sách yêu thích
                để dễ dàng tìm lại sau này.
            </p>

            <div className="space-y-4">
                <Button
                    onClick={() => navigate("/")}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                    <CarIcon className="w-5 h-5 mr-2" /> Khám phá xe điện
                </Button>

                <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                    <span>•</span>
                    <span>Miễn phí</span>
                    <span>•</span>
                    <span>Dễ dàng sử dụng</span>
                    <span>•</span>
                    <span>Uy tín</span>
                </div>
            </div>
        </div>
    </div>
);

export default WishListPage;
