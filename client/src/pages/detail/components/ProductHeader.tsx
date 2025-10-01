import { getConditionLabel } from "@/utils/productHelper";
import { formatNumberWithDots } from "@/utils/numberFormatter";
import type { Product } from "@/types/productType";

interface ProductHeaderProps {
    car: Product;
    className?: string;
}

export function ProductHeader({ car, className = "" }: ProductHeaderProps) {
    return (
        <div className={className}>
            <div className="text-gray-400 text-sm mb-2">Mã sản phẩm: #{car._id}</div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{car.brand} {car.model}</h1>
            <div className="flex items-center gap-3 mb-3">
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full text-sm font-medium">
                    {getConditionLabel(car.condition)}
                </span>
                <span className="text-sm text-gray-600">Năm {car.year}</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-yellow-600">
                {formatNumberWithDots(car.price)} VNĐ
            </div>
        </div>
    );
}
