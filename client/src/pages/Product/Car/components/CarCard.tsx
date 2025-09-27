// components/CarCard.tsx
import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { Product } from "@/types/productType";
import { formatNumberWithDots } from "@/utils/numberFormatter";
import { getConditionLabel, getProductType } from "@/utils/productHelper";
import { Badge } from "@/components/ui/badge";

interface CarCardProps {
    car: Product;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => (
    <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all p-0 overflow-hidden flex flex-col">
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
            <img
                src={car.images[0] || "/images/placeholder.jpg"}
                alt={`${car.brand} ${car.model}`}
                className="object-cover w-full h-full"
            />
        </div>
        <CardContent className="p-5 flex flex-col flex-1">
            <CardTitle className="text-base font-bold text-gray-900 mb-2">
                {car.brand} {car.model}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mb-2 text-sm">
                <span className="font-semibold text-black">{car.brand}</span>
                <span className="text-gray-400">|</span>
                <span className="font-semibold text-black">{car.year}</span>
                <span className="text-gray-400">|</span>
                <span className="font-semibold text-black">{getProductType(car.category)}</span>
            </div>
            <div className="text-sm text-gray-700 mb-3">
                <span className="font-semibold">{getConditionLabel(car.condition)}</span>
                <span className="mx-2 text-gray-400">|</span>
                <Badge variant={car.status ? "default" : "destructive"}>
                    {car.status ? "Còn hàng" : "Đã bán"}
                </Badge>
            </div>
            <div className="text-lg font-bold text-black mt-auto">
                {formatNumberWithDots(car.price)} VNĐ
            </div>
        </CardContent>
    </Card>
);

export default CarCard;
