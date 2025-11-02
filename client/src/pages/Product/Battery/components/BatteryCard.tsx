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
            className={`relative overflow-hidden flex flex-col cursor-pointer group transition-all duration-500 rounded-3xl border
        ${isHighPriority
                    ? "border-blue-400 shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_0_45px_-10px_rgba(59,130,246,0.6)]"
                    : "border-gray-100 hover:border-blue-300 hover:shadow-[0_4px_20px_-8px_rgba(59,130,246,0.3)]"
                } bg-white`}
        >
            {/* Animated Glow Border for High Priority */}
            {isHighPriority && (
                <>
                    <div className="absolute -inset-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-3xl opacity-25 blur-lg group-hover:opacity-40 transition-opacity"></div>
                </>
            )}

            {/* Image Section */}
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-3xl">
                <img
                    src={battery.images[0] || "/images/placeholder.jpg"}
                    alt={`${battery.brand} ${battery.model}`}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                />

                {/* Badges top-right */}
                <div className="absolute top-3 right-3 flex gap-2">
                    {isHighPriority && (
                        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md border-0 backdrop-blur-md flex items-center gap-1 animate-pulse">
                            <Crown className="w-3.5 h-3.5" />
                            Ưu tiên cao
                        </Badge>
                    )}
                    <Badge
                        variant={battery.status ? "default" : "destructive"}
                        className="backdrop-blur-md shadow-sm border-0 text-white font-semibold px-2"
                    >
                        {battery.status ? "Còn hàng" : "Đã bán"}
                    </Badge>
                </div>

                {/* Condition badge top-left */}
                {battery.condition && (
                    <div className="absolute top-3 left-3">
                        <Badge
                            variant="secondary"
                            className="bg-white/80 text-gray-700 border border-gray-100 backdrop-blur-md shadow-sm"
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
                        className={`text-2xl font-bold ${isHighPriority
                            ? "bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 bg-clip-text text-transparent animate-pulse"
                            : "bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
                            }`}
                    >
                        {formatNumberWithDots(battery.price)} đ
                    </div>

                    {isHighPriority && (
                        <div className="text-xs text-blue-600 font-medium mt-2 flex items-center gap-1">
                            <Crown className="w-3.5 h-3.5" />
                            <span>Sản phẩm được đẩy ưu tiên</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default BatteryCard;
