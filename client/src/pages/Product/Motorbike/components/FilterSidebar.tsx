import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FilterSidebarProps {
    brands: string[];
    colors: string[];
    types: string[];
    selectedBrand: string[];
    setSelectedBrand: React.Dispatch<React.SetStateAction<string[]>>;
    selectedColor: string[];
    setSelectedColor: React.Dispatch<React.SetStateAction<string[]>>;
    selectedType: string[];
    setSelectedType: React.Dispatch<React.SetStateAction<string[]>>;
    minPrice: number | "";
    setMinPrice: React.Dispatch<React.SetStateAction<number | "">>;
    maxPrice: number | "";
    setMaxPrice: React.Dispatch<React.SetStateAction<number | "">>;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
    brands,
    colors,
    types,
    selectedBrand,
    setSelectedBrand,
    selectedColor,
    setSelectedColor,
    selectedType,
    setSelectedType,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
}) => {
    return (
        <aside className="w-72 bg-white rounded-2xl shadow-lg p-7 h-fit border border-gray-200 sticky top-32 max-h-[calc(100vh-8rem)] overflow-y-auto">
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
                                    prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
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
                                    prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
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
                                    prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
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

            <Button
                variant="outline"
                className="w-full mt-2 border-black text-black hover:bg-gray-100"
                onClick={() => {
                    setSelectedBrand([]);
                    setSelectedColor([]);
                    setSelectedType([]);
                    setMinPrice("");
                    setMaxPrice("");
                }}
            >
                Đặt lại bộ lọc
            </Button>
        </aside>
    );
};

export default FilterSidebar;
