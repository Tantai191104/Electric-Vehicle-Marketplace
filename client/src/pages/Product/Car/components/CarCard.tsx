// components/CarCard.tsx
import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { Product } from "@/types/productType";
import { formatNumberWithDots } from "@/utils/numberFormatter";
import { getConditionLabel } from "@/utils/productHelper";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Calendar, Zap, Crown } from "lucide-react";

interface CarCardProps {
    key: string;
    car: Product;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
    const navigate = useNavigate();
    const isHighPriority = car.priorityLevel === "high" || car.isPriorityBoosted === true;
    
    console.log('Car Priority Info:', {
        id: car._id,
        title: car.title,
        level: car.priorityLevel,
        source: car.prioritySource,
        boosted: car.isPriorityBoosted,
        isHighPriority
    });

    return (
        <Card
            onClick={() => navigate(`/detail/${car._id}`)}
            className={`bg-white border rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-0 overflow-hidden flex flex-col cursor-pointer group relative ${
                isHighPriority 
                    ? "border-yellow-500 shadow-lg shadow-yellow-200/50 ring-2 ring-yellow-400 ring-opacity-50 hover:border-yellow-600 hover:shadow-yellow-300/60" 
                    : "border-gray-200 hover:border-yellow-400"
            }`}
        >
            {/* High Priority Animated Border Glow */}
            {isHighPriority && (
                <>
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 rounded-2xl blur opacity-30 group-hover:opacity-50 animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/40 via-transparent to-orange-50/40 pointer-events-none"></div>
                </>
            )}
            <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden relative">
                <img
                    src={car.images[0] || "/images/placeholder.jpg"}
                    alt={`${car.brand} ${car.model}`}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                    {isHighPriority && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg backdrop-blur-sm animate-pulse border-0 flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Ưu tiên cao
                        </Badge>
                    )}
                    <Badge variant={car.status ? "default" : "destructive"} className="shadow-lg backdrop-blur-sm">
                        {car.status ? "Còn hàng" : "Đã bán"}
                    </Badge>
                </div>
                {car.condition && (
                    <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm shadow-lg">
                            {getConditionLabel(car.condition)}
                        </Badge>
                    </div>
                )}
            </div>
            <CardContent className="p-4 flex flex-col flex-1">
                <CardTitle className="text-base font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors line-clamp-2 min-h-[3rem]">
                    {car.title || `${car.brand} ${car.model}`}
                </CardTitle>

                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{car.year}</span>
                    <span className="text-gray-300">•</span>
                    <span>{car.brand}</span>
                </div>

                {car.specifications?.batteryCapacity && (
                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
                        <Zap className="w-3.5 h-3.5 text-yellow-500" />
                        <span>{car.specifications.batteryCapacity}</span>
                    </div>
                )}

                <div className="mt-auto pt-3 border-t border-gray-100">
                    <div className={`text-xl font-bold ${
                        isHighPriority 
                            ? "bg-gradient-to-r from-yellow-600 via-orange-500 to-yellow-600 bg-clip-text text-transparent animate-pulse" 
                            : "bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent"
                    }`}>
                        {formatNumberWithDots(car.price)} đ
                    </div>
                    {isHighPriority && (
                        <div className="text-xs text-yellow-600 font-medium mt-1 flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            <span>Sản phẩm được đẩy ưu tiên</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default CarCard;
