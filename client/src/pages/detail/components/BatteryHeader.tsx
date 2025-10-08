import type { Product } from "@/types/productType";
import { formatNumberWithDots } from "@/utils/numberFormatter";

interface BatteryHeaderProps {
    battery: Product;
    className?: string;
}

export function BatteryHeader({ battery, className = "" }: BatteryHeaderProps) {
    const getCategoryLabel = (category: string): string => {
        const labels = {
            'lithium-ion': 'Lithium-ion',
            'lifepo4': 'LiFePO4',
            'lead-acid': 'Lead Acid',
            'nickel-metal': 'Ni-MH'
        };
        return labels[category as keyof typeof labels] || category;
    };

    const getCategoryColor = (category: string): string => {
        const colors = {
            'lithium-ion': 'bg-blue-100 text-blue-800',
            'lifepo4': 'bg-green-100 text-green-800',
            'lead-acid': 'bg-gray-100 text-gray-800',
            'nickel-metal': 'bg-purple-100 text-purple-800'
        };
        return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className={className}>
            <div className="text-gray-400 text-sm mb-2">Mã sản phẩm: #{battery._id}</div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {battery.brand} {battery.model}
            </h1>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`${getCategoryColor(battery.category)} px-3 py-1.5 rounded-full text-sm font-medium`}>
                    {getCategoryLabel(battery.category)}
                </span>
                {battery.specifications?.batteryCapacity && (
                    <span className="text-sm text-gray-600">
                        {battery.specifications.batteryCapacity}
                    </span>
                )}
            </div>
            <div className="text-2xl md:text-3xl font-bold text-green-600">
                {formatNumberWithDots(battery.price)} VNĐ
            </div>
        </div>
    );
}