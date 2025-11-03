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
    const isHighPriority = car.priorityLevel === "high" ;
    const isLowPriority = car.priorityLevel === "low";
    
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
            className={`p-0 overflow-hidden flex flex-col cursor-pointer group relative transition-all duration-300 ${
            isHighPriority
                ? "bg-white shadow-lg hover:shadow-xl border-amber-600 bg-gradient-to-br from-amber-50/30 to-amber-100/20"
                    : isLowPriority
                        ? "bg-gray-50 border-gray-200 opacity-95 shadow-sm hover:shadow-md"
                        : "bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg"
            } rounded-2xl`}
        >
            <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden relative">
                <img
                    src={car.images[0] || "/images/placeholder.jpg"}
                    alt={`${car.brand} ${car.model}`}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                    {isHighPriority && (
                        <Badge className="bg-yellow-500 text-white shadow-md border-0 flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Ưu tiên
                        </Badge>
                    )}
                    <Badge variant={car.status ? "default" : "destructive"} className="shadow-md">
                        {car.status ? "Còn hàng" : "Đã bán"}
                    </Badge>
                </div>
                {car.condition && (
                    <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-white/90 shadow-md">
                            {getConditionLabel(car.condition)}
                        </Badge>
                    </div>
                )}
            </div>
            <CardContent className="p-4 flex flex-col flex-1">
                <CardTitle className={`text-base font-bold mb-2 line-clamp-2 min-h-[3rem] transition-colors ${isLowPriority ? 'text-black' : 'text-gray-900 group-hover:text-amber-600'}`}>
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
                    <div className={`text-xl font-bold ${isHighPriority ? 'text-amber-600' : isLowPriority ? 'text-black' : 'text-gray-900'}`}>
                        {formatNumberWithDots(car.price)} đ
                    </div>
                    {isHighPriority && (
                        <div className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            <span>Sản phẩm ưu tiên</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default CarCard;
