// components/FilterSidebar.tsx
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

type FilterSidebarProps = {
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
};
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
        <aside className="w-full md:w-72 bg-white rounded-2xl shadow p-6 border border-gray-200 overflow-y-auto max-h-[80vh]">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Bộ lọc</h2>
            {/* Brand */}
            <div className="mb-5">
                <div className="font-semibold mb-2 text-gray-700">Hãng xe</div>
                {brands.map(brand => (
                    <label key={brand} className="flex items-center gap-2 mb-2 cursor-pointer">
                        <Checkbox
                            checked={selectedBrand.includes(brand)}
                            onCheckedChange={() =>
                                setSelectedBrand(prev =>
                                    prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
                                )
                            }
                            className="border-gray-300 data-[state=checked]:bg-black"
                        />
                        <span className="text-gray-700">{brand}</span>
                    </label>
                ))}
            </div>

            {/* Color */}
            <div className="mb-5">
                <div className="font-semibold mb-2 text-gray-700">Màu sắc</div>
                {colors.map(color => (
                    <label key={color} className="flex items-center gap-2 mb-2 cursor-pointer">
                        <Checkbox
                            checked={selectedColor.includes(color)}
                            onCheckedChange={() =>
                                setSelectedColor(prev =>
                                    prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
                                )
                            }
                            className="border-gray-300 data-[state=checked]:bg-black"
                        />
                        <span className="text-gray-700">{color}</span>
                    </label>
                ))}
            </div>

            {/* Type */}
            <div className="mb-5">
                <div className="font-semibold mb-2 text-gray-700">Loại xe</div>
                {types.map(type => (
                    <label key={type} className="flex items-center gap-2 mb-2 cursor-pointer">
                        <Checkbox
                            checked={selectedType.includes(type)}
                            onCheckedChange={() =>
                                setSelectedType(prev =>
                                    prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                                )
                            }
                            className="border-gray-300 data-[state=checked]:bg-black"
                        />
                        <span className="text-gray-700">{type}</span>
                    </label>
                ))}
            </div>

            {/* Price */}
            <div>
                <div className="font-semibold mb-2 text-gray-700">Giá</div>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        placeholder="Min"
                        value={minPrice === "" ? "" : minPrice}
                        onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : "")}
                        className="w-24"
                    />
                    <span className="text-gray-500">-</span>
                    <Input
                        type="number"
                        placeholder="Max"
                        value={maxPrice === "" ? "" : maxPrice}
                        onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
                        className="w-24"
                    />
                </div>
            </div>
        </aside>
    );
};

export default FilterSidebar;
