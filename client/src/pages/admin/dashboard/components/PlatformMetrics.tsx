import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp } from "react-icons/fi";
import { useEffect, useState } from "react";
import { adminServices, type MetricData } from "@/services/adminServices";

interface PlatformMetricsProps {
    timeRange?: string;
}

export const PlatformMetrics: React.FC<PlatformMetricsProps> = ({ timeRange }) => {
    const [metricsData, setMetricsData] = useState<MetricData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                setLoading(true);
                const data = await adminServices.getPlatformMetrics(
                    timeRange ? { range: timeRange } : undefined
                );
                setMetricsData(data);
            } catch (error) {
                console.error("Failed to fetch metrics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [timeRange]);

    if (loading || !metricsData) {
        return <div>Đang tải dữ liệu...</div>;
    }

    // Dùng optional chaining và default value để tránh undefined
    const metrics = [
        {
            title: "Tổng người dùng",
            value: (metricsData?.totalUsers ?? 0).toLocaleString(),
            change: `${metricsData?.percentageChanges?.users ?? 0 >= 0 ? "+" : ""}${metricsData?.percentageChanges?.users ?? 0}%`,
            changeType: (metricsData?.percentageChanges?.users ?? 0) >= 0 ? "increase" : "decrease",
            icon: FiUsers,
            description: "Người mua và người bán",
            color: "bg-blue-500"
        },
        {
            title: "Tin đăng hoạt động",
            value: (metricsData?.totalProducts ?? 0).toLocaleString(),
            change: `${metricsData?.percentageChanges?.products ?? 0 >= 0 ? "+" : ""}${metricsData?.percentageChanges?.products ?? 0}%`,
            changeType: (metricsData?.percentageChanges?.products ?? 0) >= 0 ? "increase" : "decrease",
            icon: FiShoppingBag,
            description: "Xe điện đang được bán",
            color: "bg-green-500"
        },
        {
            title: "Doanh thu",
            value: `₫${((metricsData?.totalCommission ?? 0) / 1e6).toFixed(0)}M`,
            change: `${metricsData?.percentageChanges?.commission ?? 0 >= 0 ? "+" : ""}${metricsData?.percentageChanges?.commission ?? 0}%`,
            changeType: (metricsData?.percentageChanges?.commission ?? 0) >= 0 ? "increase" : "decrease",
            icon: FiDollarSign,
            description: "Phí giao dịch thu được",
            color: "bg-purple-500"
        },
        {
            title: "Giao dịch thành công",
            value: (metricsData?.totalOrders ?? 0).toLocaleString(),
            change: `${metricsData?.percentageChanges?.orders ?? 0 >= 0 ? "+" : ""}${metricsData?.percentageChanges?.orders ?? 0}%`,
            changeType: (metricsData?.percentageChanges?.orders ?? 0) >= 0 ? "increase" : "decrease",
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
