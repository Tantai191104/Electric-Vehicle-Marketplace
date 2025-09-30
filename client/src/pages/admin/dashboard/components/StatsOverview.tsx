import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    FiTrendingUp,
    FiUsers,
    FiDollarSign,
    FiEye,
    FiShoppingCart,
    FiClock,
    FiArrowUp,
    FiArrowDown
} from "react-icons/fi";

interface Props {
    timeRange: string;
}

export const StatsOverview: React.FC<Props> = ({ timeRange }) => {
    const stats = [
        {
            title: "Tổng doanh thu",
            value: "2,847,250,000",
            unit: "VNĐ",
            change: 12.5,
            trend: "up",
            icon: FiDollarSign
        },
        {
            title: "Sản phẩm đã bán",
            value: "1,284",
            unit: "sản phẩm",
            change: 8.2,
            trend: "up",
            icon: FiShoppingCart
        },
        {
            title: "Người dùng mới",
            value: "3,126",
            unit: "người",
            change: -2.1,
            trend: "down",
            icon: FiUsers
        },
        {
            title: "Sản phẩm chờ duyệt",
            value: "47",
            unit: "sản phẩm",
            change: 15.8,
            trend: "up",
            icon: FiClock
        },
        {
            title: "Lượt xem",
            value: "127,834",
            unit: "lượt",
            change: 22.3,
            trend: "up",
            icon: FiEye
        },
        {
            title: "Tỷ lệ chuyển đổi",
            value: "3.24",
            unit: "%",
            change: 1.8,
            trend: "up",
            icon: FiTrendingUp
        }
    ];

    const formatNumber = (num: string) => {
        return new Intl.NumberFormat('vi-VN').format(parseInt(num));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                const isPositive = stat.trend === "up";

                return (
                    <Card
                        key={index}
                        className="group  transition-all duration-300 border border-gray-200 bg-white shadow-lg hover:shadow-2xl"
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <Badge
                                    variant={isPositive ? "default" : "destructive"}
                                    className={`gap-1 text-xs shadow-sm ${isPositive
                                            ? "bg-gray-900 text-white hover:bg-gray-800"
                                            : "bg-red-100 text-red-700 border border-red-200"
                                        }`}
                                >
                                    {isPositive ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
                                    {Math.abs(stat.change)}%
                                </Badge>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-gray-900">
                                        {formatNumber(stat.value)}
                                    </span>
                                    <span className="text-sm text-gray-500">{stat.unit}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};