import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumberWithDots } from "@/utils/numberFormatter";
import { getConditionLabel, getProductType } from "@/utils/productHelper";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiX, FiEye, FiHeart } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import type { Product } from "@/types/productType";

interface WishlistCardProps {
    product: Product;
    onRemove: () => void;
    onView: () => void;
    isRemoving: boolean;
}

const WishlistCard: React.FC<WishlistCardProps> = ({ product, onRemove, onView, isRemoving }) => (
    <Card className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden transform hover:-translate-y-1">
        {/* Remove Button */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                disabled={isRemoving}
                className="bg-white/90 backdrop-blur-sm hover:bg-red-50 hover:text-red-500 rounded-full p-2 shadow-lg border border-white/50"
            >
                {isRemoving ? (
                    <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin text-gray-500" />
                ) : (
                    <FiX className="w-4 h-4" />
                )}
            </Button>
        </div>

        {/* Wishlist Badge */}
        <div className="absolute top-3 left-3 z-10">
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                <FiHeart className="w-3 h-3 fill-current" />
                Yêu thích
            </div>
        </div>

        {/* Product Image */}
        <div
            className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={onView}
        >
            <img
                src={product.images[0] || "/images/placeholder.jpg"}
                alt={product.title || `${product.brand} ${product.model}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                    <FiEye className="w-5 h-5 text-gray-700" />
                </div>
            </div>
        </div>

        {/* Product Info */}
        <CardContent className="p-5 flex flex-col flex-1">
            <h3
                className="text-lg font-bold text-gray-900 mb-3 cursor-pointer hover:text-yellow-600 transition-colors line-clamp-2 min-h-[3.5rem]"
                onClick={onView}
            >
                {product.title || `${product.brand} ${product.model}`}
            </h3>

            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-3">
                <span className="bg-gray-100 px-2 py-1 rounded-full font-medium text-gray-700">
                    {product.brand}
                </span>
                <span className="bg-blue-100 px-2 py-1 rounded-full font-medium text-blue-700">
                    {product.year}
                </span>
                <span className="bg-green-100 px-2 py-1 rounded-full font-medium text-green-700">
                    {getProductType(product.category)}
                </span>
            </div>

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <MdVerified className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">{getConditionLabel(product.condition)}</span>
                </div>
                <Badge
                    variant={product.status === "available" ? "default" : "destructive"}
                    className="shadow-sm"
                >
                    {product.status === "available" ? "Còn hàng" : "Đã bán"}
                </Badge>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 mb-4">
                <div className="text-2xl font-bold text-gray-900 text-center">
                    {formatNumberWithDots(product.price)}
                    <span className="text-sm font-normal text-gray-600 ml-1">VNĐ</span>
                </div>
            </div>

            <Button
                onClick={onView}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2.5 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
                <FiEye className="w-4 h-4 mr-2" />
                Xem chi tiết
            </Button>
        </CardContent>
    </Card>
);

export default WishlistCard;
