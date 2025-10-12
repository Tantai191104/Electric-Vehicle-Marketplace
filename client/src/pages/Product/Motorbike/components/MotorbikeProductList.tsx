import React, { useState } from "react";

import MotorbikeCard from "./MotorbikeCard";
import FilterSidebar from "./FilterSidebar";

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

const motorbikes: Motorbike[] = [
    { id: 1, name: "VinFast Klara S", image: "/images/klaras.jpg", price: 35000000, brand: "VinFast", year: 2023, status: "Mới", color: "Đen", type: "Scooter" },
    { id: 2, name: "Yadea G5", image: "/images/yadeag5.jpg", price: 29000000, brand: "Yadea", year: 2022, status: "Đã qua sử dụng", color: "Trắng", type: "Scooter" },
    { id: 3, name: "Pega Aura", image: "/images/pegaaura.jpg", price: 25000000, brand: "Pega", year: 2023, status: "Mới", color: "Xám", type: "Cub" },
];

const brands = ["VinFast", "Yadea", "Pega"];
const colors = ["Đen", "Trắng", "Xám"];
const types = ["Scooter", "Cub"];

const MotorbikeProductList: React.FC = () => {
    const [selectedBrand, setSelectedBrand] = useState<string[]>([]);
    const [selectedColor, setSelectedColor] = useState<string[]>([]);
    const [selectedType, setSelectedType] = useState<string[]>([]);
    const [minPrice, setMinPrice] = useState<number | "">("");
    const [maxPrice, setMaxPrice] = useState<number | "">("");

    const filteredMotorbikes = motorbikes.filter((bike) => {
        const brandOk = selectedBrand.length === 0 || selectedBrand.includes(bike.brand);
        const colorOk = selectedColor.length === 0 || selectedColor.includes(bike.color);
        const typeOk = selectedType.length === 0 || selectedType.includes(bike.type);
        const minOk = minPrice === "" || bike.price >= minPrice;
        const maxOk = maxPrice === "" || bike.price <= maxPrice;
        return brandOk && colorOk && typeOk && minOk && maxOk;
    });

    return (
        <div className="max-w-7xl mx-auto mt-32 py-12 px-4">
            <div className="flex gap-8">
                <FilterSidebar
                    brands={brands}
                    colors={colors}
                    types={types}
                    selectedBrand={selectedBrand}
                    setSelectedBrand={setSelectedBrand}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    minPrice={minPrice}
                    setMinPrice={setMinPrice}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                />
                <main className="flex-1">
                    <div className="flex justify-between items-center mb-10">
                        <h1 className="text-4xl font-bold text-black">Danh sách xe máy điện</h1>
                        <select className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 font-medium bg-white">
                            <option>Sắp xếp theo phổ biến</option>
                            <option>Giá tăng dần</option>
                            <option>Giá giảm dần</option>
                            <option>Mới nhất</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {filteredMotorbikes.length === 0 ? (
                            <div className="col-span-3 text-center text-gray-400 text-lg py-12">
                                Không tìm thấy xe phù hợp.
                            </div>
                        ) : (
                            filteredMotorbikes.map((bike) => <MotorbikeCard key={bike.id} bike={bike} />)
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MotorbikeProductList;
