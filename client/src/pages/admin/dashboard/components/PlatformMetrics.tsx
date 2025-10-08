import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp } from "react-icons/fi";

interface PlatformMetricsProps {
    timeRange: string;
}

export const PlatformMetrics: React.FC<PlatformMetricsProps> = () => {
    const metrics = [
        {
            title: "Tổng người dùng",
            value: "12,543",
            change: "+8.2%",
            changeType: "increase",
            icon: FiUsers,
            description: "Người mua và người bán",
            color: "bg-blue-500"
        },
        {
            title: "Tin đăng hoạt động",
            value: "3,247",
            change: "+12.5%",
            changeType: "increase",
            icon: FiShoppingBag,
            description: "Xe điện đang được bán",
            color: "bg-green-500"
        },
        {
            title: "Doanh thu hoa hồng",
            value: "₫847M",
            change: "+23.1%",
            changeType: "increase",
            icon: FiDollarSign,
            description: "Phí giao dịch thu được",
            color: "bg-purple-500"
        },
        {
            title: "Giao dịch thành công",
            value: "1,892",
            change: "+15.3%",
            changeType: "increase",
            icon: FiTrendingUp,
            description: "Xe đã được bán thành công",
            color: "bg-orange-500"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 ${metric.color} rounded-xl flex items-center justify-center shadow-lg`}>
                            <metric.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${metric.changeType === "increase"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}>
                            {metric.change}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
                        <p className="text-sm font-medium text-gray-700">{metric.title}</p>
                        <p className="text-xs text-gray-500">{metric.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};