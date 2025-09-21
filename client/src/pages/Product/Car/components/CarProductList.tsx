// components/CarProductList.tsx
import React, { useState } from "react";
import CarCard from "./CarCard";
import FilterSidebar from "./FilterSidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const cars: Car[] = [
    { id: 1, name: "VinFast VF e34", image: "/images/vfe34.jpg", price: 690000000, brand: "VinFast", year: 2023, status: "Đã qua sử dụng", color: "Đen", type: "SUV" },
    { id: 2, name: "Tesla Model 3", image: "/images/model3.jpg", price: 1200000000, brand: "Tesla", year: 2022, status: "Đã qua sử dụng", color: "Trắng", type: "Sedan" },
    { id: 3, name: "KIA EV6", image: "/images/kiaev6.jpg", price: 850000000, brand: "KIA", year: 2023, status: "Đã qua sử dụng", color: "Xám", type: "SUV" },
];

const brands = ["VinFast", "Tesla", "KIA"];
const colors = ["Đen", "Trắng", "Xám"];
const types = ["SUV", "Sedan"];

const CarProductList: React.FC = () => {
    const [selectedBrand, setSelectedBrand] = useState<string[]>([]);
    const [selectedColor, setSelectedColor] = useState<string[]>([]);
    const [selectedType, setSelectedType] = useState<string[]>([]);
    const [minPrice, setMinPrice] = useState<number | "">("");
    const [maxPrice, setMaxPrice] = useState<number | "">("");

    const filteredCars = cars.filter(car => {
        const brandOk = selectedBrand.length === 0 || selectedBrand.includes(car.brand);
        const colorOk = selectedColor.length === 0 || selectedColor.includes(car.color);
        const typeOk = selectedType.length === 0 || selectedType.includes(car.type);
        const minOk = minPrice === "" || car.price >= minPrice;
        const maxOk = maxPrice === "" || car.price <= maxPrice;
        return brandOk && colorOk && typeOk && minOk && maxOk;
    });

    return (
        <div className="max-w-7xl mx-auto mt-[180px] px-4 md:px-0">
            <div className="flex flex-col md:flex-row gap-8">
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
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Danh sách xe điện</h1>
                        <Select>
                            <SelectTrigger className="w-52 min-w-[200px]">
                                <SelectValue placeholder="Sắp xếp theo" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectItem value="popular">Phổ biến</SelectItem>
                                <SelectItem value="priceAsc">Giá tăng dần</SelectItem>
                                <SelectItem value="priceDesc">Giá giảm dần</SelectItem>
                                <SelectItem value="newest">Mới nhất</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {filteredCars.length === 0 ? (
                            <div className="col-span-3 text-center text-gray-400 py-12">
                                Không tìm thấy xe phù hợp.
                            </div>
                        ) : (
                            filteredCars.map(car => <CarCard key={car.id} car={car} />)
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CarProductList;
