import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import MotorbikeCard from "./components/MotorbikeCard";

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
    {
        id: 1,
        name: "VinFast Klara S",
        image: "/images/klaras.jpg",
        price: 35000000,
        brand: "VinFast",
        year: 2023,
        status: "Mới",
        color: "Đen",
        type: "Scooter",
    },
    {
        id: 2,
        name: "Yadea G5",
        image: "/images/yadeag5.jpg",
        price: 29000000,
        brand: "Yadea",
        year: 2022,
        status: "Đã qua sử dụng",
        color: "Trắng",
        type: "Scooter",
    },
    {
        id: 3,
        name: "Pega Aura",
        image: "/images/pegaaura.jpg",
        price: 25000000,
        brand: "Pega",
        year: 2023,
        status: "Mới",
        color: "Xám",
        type: "Cub",
    },
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
                {/* Filter Sidebar */}
                <aside className="w-72 bg-white rounded-2xl shadow-lg p-7 h-fit border border-gray-200">
                    <h2 className="text-2xl font-bold mb-7 text-black">Bộ lọc</h2>
                    {/* Brand */}
                    <div className="mb-6">
                        <div className="font-semibold mb-3 text-gray-900">Hãng xe</div>
                        {brands.map((brand) => (
                            <label key={brand} className="flex items-center mb-3 cursor-pointer gap-3">
                                <Checkbox
                                    checked={selectedBrand.includes(brand)}
                                    onCheckedChange={() =>
                                        setSelectedBrand((prev) =>
                                            prev.includes(brand)
                                                ? prev.filter((b) => b !== brand)
                                                : [...prev, brand]
                                        )
                                    }
                                    className="border-gray-400 data-[state=checked]:bg-black"
                                />
                                <span className="text-gray-800">{brand}</span>
                            </label>
                        ))}
                    </div>
                    {/* Color */}
                    <div className="mb-6">
                        <div className="font-semibold mb-3 text-gray-900">Màu sắc</div>
                        {colors.map((color) => (
                            <label key={color} className="flex items-center mb-3 cursor-pointer gap-3">
                                <Checkbox
                                    checked={selectedColor.includes(color)}
                                    onCheckedChange={() =>
                                        setSelectedColor((prev) =>
                                            prev.includes(color)
                                                ? prev.filter((c) => c !== color)
                                                : [...prev, color]
                                        )
                                    }
                                    className="border-gray-400 data-[state=checked]:bg-black"
                                />
                                <span className="text-gray-800">{color}</span>
                            </label>
                        ))}
                    </div>
                    {/* Type */}
                    <div className="mb-6">
                        <div className="font-semibold mb-3 text-gray-900">Loại xe</div>
                        {types.map((type) => (
                            <label key={type} className="flex items-center mb-3 cursor-pointer gap-3">
                                <Checkbox
                                    checked={selectedType.includes(type)}
                                    onCheckedChange={() =>
                                        setSelectedType((prev) =>
                                            prev.includes(type)
                                                ? prev.filter((t) => t !== type)
                                                : [...prev, type]
                                        )
                                    }
                                    className="border-gray-400 data-[state=checked]:bg-black"
                                />
                                <span className="text-gray-800">{type}</span>
                            </label>
                        ))}
                    </div>
                    {/* Price */}
                    <div className="mb-6">
                        <div className="font-semibold mb-3 text-gray-900">Giá</div>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={minPrice === "" ? "" : minPrice}
                                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")}
                                className="w-20 px-2 py-2 border border-gray-300 rounded-lg bg-white text-black"
                            />
                            <span className="text-gray-500">-</span>
                            <Input
                                type="number"
                                placeholder="Max"
                                value={maxPrice === "" ? "" : maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
                                className="w-20 px-2 py-2 border border-gray-300 rounded-lg bg-white text-black"
                            />
                        </div>
                    </div>
                    <Button variant="outline" className="w-full mt-2 border-black text-black hover:bg-gray-100">
                        Đặt lại bộ lọc
                    </Button>
                </aside>
                {/* Motorbike List */}
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
                            filteredMotorbikes.map((bike) => (
                                <MotorbikeCard key={bike.id} bike={bike} />
                            ))
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MotorbikeProductList;