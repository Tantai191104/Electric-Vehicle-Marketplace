import type { Product } from "@/types/productType";
import { getConditionLabel } from "@/utils/productHelper";
import type { ReactNode } from "react";

interface Specification {
    label: string;
    value: string | ReactNode;
}

interface SpecificationTableProps {
    product: Product;
    className?: string;
}

export function SpecificationTable({ product, className = "" }: SpecificationTableProps) {
    const specifications: Specification[] = [];

    // Dùng chung cho cả 2 loại
    specifications.push(
        { label: "Thương hiệu", value: product.brand },
        { label: "Model", value: product.model },
        { label: "Năm sản xuất", value: `${product.year} năm` },
        {
            label: "Tình trạng",
            value: (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs font-medium">
                    {getConditionLabel(product.condition)}
                </span>
            )
        }
    );

    // Nếu là xe
    if (product.category === "vehicle" && product.specifications) {
        const { range, batteryCapacity, maxSpeed, chargingTime, power, motorType, batteryType, voltage, warranty } =
            product.specifications;

        if (range) specifications.push({ label: "Quãng đường di chuyển", value: `${range} km` });
        if (batteryCapacity) specifications.push({ label: "Dung lượng pin", value: `${batteryCapacity} kWh` });
        if (maxSpeed) specifications.push({ label: "Tốc độ tối đa", value: `${maxSpeed} km/h` });
        if (chargingTime) specifications.push({ label: "Thời gian sạc đầy", value: `${chargingTime} giờ` });
        if (power) specifications.push({ label: "Công suất động cơ", value: `${power} kW` });
        if (motorType) specifications.push({ label: "Loại động cơ", value: motorType });
        if (batteryType) specifications.push({ label: "Loại pin", value: batteryType });
        if (voltage) specifications.push({ label: "Điện áp", value: `${voltage}V` });
        if (warranty) specifications.push({ label: "Bảo hành", value: warranty });
    }

    // Nếu là pin
    if (product.category === "battery" && product.specifications) {
        const { batteryCapacity, voltage, capacity, cycleLife, chargingTime, operatingTemperature, weight, dimensions, warranty, compatibility } =
            product.specifications;

        if (batteryCapacity) specifications.push({ label: "Dung lượng pin", value: `${batteryCapacity} kWh` });
        if (voltage) specifications.push({ label: "Điện áp", value: `${voltage} V` });
        if (capacity) specifications.push({ label: "Công suất", value: `${capacity} Ah` });
        if (cycleLife) specifications.push({ label: "Chu kỳ sống", value: cycleLife });
        if (chargingTime) specifications.push({ label: "Thời gian sạc", value: chargingTime });
        if (operatingTemperature) specifications.push({ label: "Nhiệt độ hoạt động", value: operatingTemperature });
        if (weight) specifications.push({ label: "Trọng lượng", value: weight });
        if (dimensions) specifications.push({ label: "Kích thước", value: dimensions });
        if (warranty) specifications.push({ label: "Bảo hành", value: warranty });
        if (compatibility) specifications.push({ label: "Tương thích", value: compatibility });
    }

    return (
        <div className={`bg-gray-50 rounded-xl p-4 ${className}`}>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Thông số kỹ thuật</h3>
            <table className="w-full text-sm">
                <tbody>
                    {specifications.map((spec, index) => (
                        <tr key={index} className="border-b border-gray-200 last:border-b-0">
                            <td className="text-gray-500 py-2 pr-4 w-1/2">{spec.label}:</td>
                            <td className="text-gray-800 py-2 font-semibold">{spec.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
