// components/CarCard.tsx
import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

type Car = {
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

interface CarCardProps {
    car: Car;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => (
    <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all p-0 overflow-hidden flex flex-col">
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
            <img
                src={car.image}
                alt={car.name}
                className="object-cover w-full h-full"
            />
        </div>
        <CardContent className="p-5 flex flex-col flex-1">
            <CardTitle className="text-base font-bold text-gray-900 mb-2">
                {car.name}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mb-2 text-sm">
                <span className="font-semibold text-black">{car.brand}</span>
                <span className="text-gray-400">|</span>
                <span className="font-semibold text-black">{car.year}</span>
                <span className="text-gray-400">|</span>
                <span className="font-semibold text-black">{car.type}</span>
            </div>
            <div className="text-sm text-gray-700 mb-3">
                <span className="font-semibold">{car.status}</span>
                <span className="mx-2 text-gray-400">|</span>
                <span className="font-semibold">{car.color}</span>
            </div>
            <div className="text-lg font-bold text-black mt-auto">
                {car.price.toLocaleString("vi-VN")} VND
            </div>
        </CardContent>
    </Card>
);

export default CarCard;
