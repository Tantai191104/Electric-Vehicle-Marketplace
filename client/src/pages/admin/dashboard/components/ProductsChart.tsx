import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiPackage, FiTrendingUp, FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";

interface Props {
    timeRange: string;
}

export const ProductsChart: React.FC<Props> = () => {
    // Mock data - thay thế bằng real data từ API
    const productStats = {
        total: 2847,
        active: 2156,
        pending: 47,
        inactive: 644,
        growth: 8.3
    };

    const categoryData = [
        { name: "Xe điện", count: 1245, percentage: 43.7, color: "emerald" },
        { name: "Pin xe điện", count: 892, percentage: 31.3, color: "blue" },
        { name: "Sạc xe điện", count: 456, percentage: 16.0, color: "purple" },
        { name: "Phụ kiện", count: 254, percentage: 8.9, color: "amber" }
    ];

    const statusData = [
        {
            status: "Đang hoạt động",
            count: productStats.active,
            percentage: (productStats.active / productStats.total) * 100,
            icon: FiCheckCircle,
            color: "emerald"
        },
        {
            status: "Chờ duyệt",
            count: productStats.pending,
            percentage: (productStats.pending / productStats.total) * 100,
            icon: FiClock,
            color: "amber"
        },
        {
            status: "Tạm dừng",
            count: productStats.inactive,
            percentage: (productStats.inactive / productStats.total) * 100,
            icon: FiXCircle,
            color: "red"
        }
    ];

    const getColorClasses = (color: string) => {
        const colors = {
            emerald: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-100" },
            blue: { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-100" },
            purple: { bg: "bg-purple-500", text: "text-purple-600", light: "bg-purple-100" },
            amber: { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-100" },
            red: { bg: "bg-red-500", text: "text-red-600", light: "bg-red-100" }
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    return (
        <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
                                <FiPackage className="w-4 h-4 text-white" />
                            </div>
                            Phân tích sản phẩm
                        </CardTitle>
                        <p className="text-gray-600 text-sm mt-1">
                            Thống kê theo danh mục và trạng thái
                        </p>
                    </div>
                    <Badge className="gap-1 bg-blue-100 text-blue-700 border-blue-200">
                        <FiTrendingUp className="w-3 h-3" />
                        +{productStats.growth}%
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-600 font-medium">Tổng sản phẩm</p>
                        <p className="text-2xl font-bold text-blue-700">
                            {new Intl.NumberFormat('vi-VN').format(productStats.total)}
                        </p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                        <p className="text-sm text-emerald-600 font-medium">Đang bán</p>
                        <p className="text-2xl font-bold text-emerald-700">
                            {new Intl.NumberFormat('vi-VN').format(productStats.active)}
                        </p>
                    </div>
                </div>

                {/* Category Distribution */}
                <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Phân bổ theo danh mục</h4>
                    <div className="space-y-3">
                        {categoryData.map((category, index) => {
                            const colors = getColorClasses(category.color);
                            return (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-16 text-xs text-gray-600 font-medium">
                                        {category.percentage.toFixed(1)}%
                                    </div>
                                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                                        <div
                                            className={`h-full ${colors.bg} rounded-full transition-all duration-1000 ease-out flex items-center justify-start pl-3`}
                                            style={{ width: `${category.percentage}%` }}
                                        >
                                            <span className="text-xs text-white font-semibold">
                                                {category.name}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-12 text-xs text-gray-600 text-right font-medium">
                                        {category.count}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Status Distribution */}
                <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Trạng thái sản phẩm</h4>
                    <div className="space-y-2">
                        {statusData.map((item, index) => {
                            const Icon = item.icon;
                            const colors = getColorClasses(item.color);
                            return (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg ${colors.light} flex items-center justify-center`}>
                                            <Icon className={`w-4 h-4 ${colors.text}`} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.status}</p>
                                            <p className="text-xs text-gray-600">{item.percentage.toFixed(1)}% tổng số</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{item.count}</p>
                                        <p className="text-xs text-gray-600">sản phẩm</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};