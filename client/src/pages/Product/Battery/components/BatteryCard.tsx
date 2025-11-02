// components/BatteryCard.tsx
import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { Product } from "@/types/productType";
import { formatNumberWithDots } from "@/utils/numberFormatter";
import { getConditionLabel } from "@/utils/productHelper";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Calendar, Battery, Zap } from "lucide-react";

interface BatteryCardProps {
    key: string;
    battery: Product;
}

const BatteryCard: React.FC<BatteryCardProps> = ({ battery }) => {
    const navigate = useNavigate();

    return (
        <Card
            onClick={() => navigate(`/detail/${battery._id}`)}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 p-0 overflow-hidden flex flex-col cursor-pointer group"
        >
            <div className="w-full aspect-[4/3] bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden relative">
                <img
                    src={battery.images[0] || "/images/placeholder.jpg"}
                    alt={`${battery.brand} ${battery.model}`}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                    <Badge variant={battery.status ? "default" : "destructive"} className="shadow-lg backdrop-blur-sm">
                        {battery.status ? "Còn hàng" : "Đã bán"}
                    </Badge>
                </div>
                {battery.condition && (
                    <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm shadow-lg">
                            {getConditionLabel(battery.condition)}
                        </Badge>
                    </div>
                )}
            </div>
            <CardContent className="p-4 flex flex-col flex-1">
                <CardTitle className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]">
                    {battery.title || `${battery.brand} ${battery.model}`}
                </CardTitle>

                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{battery.year}</span>
                    <span className="text-gray-300">•</span>
                    <span>{battery.brand}</span>
                </div>

                <div className="space-y-1.5 mb-3">
                    {battery.specifications?.voltage && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Zap className="w-3.5 h-3.5 text-blue-500" />
                            <span>Điện áp: {battery.specifications.voltage}</span>
                        </div>
                    )}
                    {battery.specifications?.capacity && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Battery className="w-3.5 h-3.5 text-blue-500" />
                            <span>Dung lượng: {battery.specifications.capacity}</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100">
                    <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        {formatNumberWithDots(battery.price)} đ
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default BatteryCard;
