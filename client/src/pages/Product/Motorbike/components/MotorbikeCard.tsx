import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Motorbike = {
    id: number;
    name: string;
    image: string;
    price: number;
    brand: string;
    year: number;
    status: string;
    color: string;
    type: string;
};

interface MotorbikeCardProps {
    bike: Motorbike;
}

const MotorbikeCard: React.FC<MotorbikeCardProps> = ({ bike }) => (
    <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all rounded-2xl border border-gray-200 bg-white group flex flex-col">
        <CardHeader className="p-0">
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                    src={bike.image}
                    alt={bike.name}
                    className="object-cover w-full h-full"
                />
            </div>
        </CardHeader>
        <CardContent className="p-5 flex flex-col flex-1">
            <CardTitle className="text-base font-bold text-gray-900 mb-2">
                {bike.name}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mb-2 text-sm">
                <span className="font-semibold text-black">{bike.brand}</span>
                <span className="text-gray-400">|</span>
                <span className="font-semibold text-black">{bike.year}</span>
                <span className="text-gray-400">|</span>
                <span className="font-semibold text-black">{bike.type}</span>
            </div>
            <div className="text-sm text-gray-700 mb-3">
                <span className="font-semibold">{bike.status}</span>
                <span className="mx-2 text-gray-400">|</span>
                <span className="font-semibold">{bike.color}</span>
            </div>
            <div className="text-lg font-bold text-black mt-auto">
                {bike.price.toLocaleString("vi-VN")} VND
            </div>
        </CardContent>
    </Card>
);

export default MotorbikeCard;