// components/BatteryCard.tsx
import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { Product } from "@/types/productType";
import { formatNumberWithDots } from "@/utils/numberFormatter";
import { getConditionLabel } from "@/utils/productHelper";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Calendar, Battery, Zap, Crown } from "lucide-react";

interface BatteryCardProps {
    battery: Product;
}

const BatteryCard: React.FC<BatteryCardProps> = ({ battery }) => {
    const navigate = useNavigate();
    const isHighPriority = battery.priorityLevel === "high" || battery.isPriorityBoosted === true;
    
    console.log('Battery Priority Info:', {
        id: battery._id,
        title: battery.title,
        level: battery.priorityLevel,
        source: battery.prioritySource,
        boosted: battery.isPriorityBoosted,
        isHighPriority
    }); 
    
    return (
        <Card
            onClick={() => navigate(`/detail/${battery._id}`)}
            className={`relative overflow-hidden flex flex-col cursor-pointer group transition-all duration-300 rounded-2xl border
        ${isHighPriority
                    ? "border-blue-400 bg-gradient-to-br from-blue-50/30 to-cyan-50/20 shadow-md"
                    : "border-gray-200 hover:border-gray-300 shadow-sm"
                } bg-white hover:shadow-lg`}
        >

            {/* Image Section */}
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-2xl">
                <img
                    src={battery.images[0] || "/images/placeholder.jpg"}
                    alt={`${battery.brand} ${battery.model}`}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />

                {/* Badges top-right */}
                <div className="absolute top-3 right-3 flex gap-2">
                    {isHighPriority && (
                        <Badge className="bg-blue-500 text-white shadow-md border-0 flex items-center gap-1">
                            <Crown className="w-3.5 h-3.5" />
                            Ưu tiên
                        </Badge>
                    )}
                    <Badge
                        variant={battery.status ? "default" : "destructive"}
                        className="shadow-md border-0 text-white font-semibold"
                    >
                        {battery.status ? "Còn hàng" : "Đã bán"}
                    </Badge>
                </div>

                {/* Condition badge top-left */}
                {battery.condition && (
                    <div className="absolute top-3 left-3">
                        <Badge
                            variant="secondary"
                            className="bg-white/90 text-gray-700 shadow-md"
                        >
                            {getConditionLabel(battery.condition)}
                        </Badge>
                    </div>
                )}
            </div>

            {/* Content */}
            <CardContent className="relative flex flex-col flex-1 p-5">
                <CardTitle className="text-lg font-semibold text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]">
                    {battery.title || `${battery.brand} ${battery.model}`}
                </CardTitle>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{battery.year}</span>
                    <span className="text-gray-300">•</span>
                    <span>{battery.brand}</span>
                </div>

                <div className="space-y-1.5 text-sm text-gray-700 mb-4">
                    {battery.specifications?.voltage && (
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-cyan-500" />
                            <span>Điện áp: {battery.specifications.voltage}</span>
                        </div>
                    )}
                    {battery.specifications?.capacity && (
                        <div className="flex items-center gap-2">
                            <Battery className="w-4 h-4 text-blue-500" />
                            <span>Dung lượng: {battery.specifications.capacity}</span>
                        </div>
                    )}
                </div>

                {/* Price */}
                <div className="mt-auto pt-3 border-t border-gray-100">
                    <div
                        className={`text-xl font-bold ${isHighPriority
                            ? "text-blue-600"
                            : "text-gray-900"
                            }`}
                    >
                        {formatNumberWithDots(battery.price)} đ
                    </div>

                    {isHighPriority && (
                        <div className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
                            <Crown className="w-3.5 h-3.5" />
                            <span>Sản phẩm ưu tiên</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default BatteryCard;
