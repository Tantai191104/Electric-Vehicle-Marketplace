import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp } from "react-icons/fi";
import { useEffect, useState } from "react";
import { adminServices, type MetricData } from "@/services/adminServices";
import { formatVND } from "@/utils/formatVND";

interface PlatformMetricsProps {
    timeRange?: string;
}

export const PlatformMetrics: React.FC<PlatformMetricsProps> = ({ timeRange }) => {
    const [metricsData, setMetricsData] = useState<MetricData | null>(null);
    const [subscriptionData, setSubscriptionData] = useState<{
        totalRevenue: number;
        totalPurchases: number;
    } | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                setLoading(true);
                // Build params so both endpoints receive the same date window.
                const buildParams = (range?: string) => {
                    if (!range) return undefined;
                    const m = /^([0-9]+)(d|y)$/.exec(range);
                    if (!m) return { range };
                    const n = parseInt(m[1], 10);
                    const unit = m[2];
                    const end = new Date();
                    const start = new Date();
                    if (unit === 'd') {
                        start.setDate(end.getDate() - n + 1); // include today
                    } else if (unit === 'y') {
                        start.setFullYear(end.getFullYear() - n + 1);
                    }
                    const toDate = (d: Date) => d.toISOString().split('T')[0];
                    return { startDate: toDate(start), endDate: toDate(end) };
                };

                const params = buildParams(timeRange);

                const [metrics, subscription] = await Promise.all([
                    adminServices.getPlatformMetrics(params),
                    adminServices.getSubscriptionRevenue(params),
                ]);
                setMetricsData(metrics);
                setSubscriptionData({
                    totalRevenue: subscription.summary.totalRevenue,
                    totalPurchases: subscription.summary.totalPurchases,
                });

                // Debug: print full API responses so we can inspect why revenue/fees look off
                // Check in browser console -> Network to see exact payloads as well.
                try {
                    console.debug("/admin/stats response (metrics):", metrics);
                } catch (e) {
                    console.debug("/admin/stats logging error", e);
                }
                try {
                    console.debug("/admin/subscriptions/revenue response (subscription):", subscription);
                } catch (e) {
                    console.debug("/admin/subscriptions/revenue logging error", e);
                }
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

    // Tính doanh thu
    const totalRevenue = metricsData?.totalRevenue ?? 0; // Đã bao gồm cả xe & pin + subscription
    const subscriptionRevenue = subscriptionData?.totalRevenue ?? 0;
    const orderRevenue = totalRevenue - subscriptionRevenue; // Doanh thu xe & pin = tổng - subscription

    // Dùng optional chaining và default value để tránh undefined
    const metrics = [
        {
            title: "Tổng người dùng",
            value: (metricsData?.totalUsers ?? 0).toLocaleString(),
            change: `${metricsData?.percentageChanges?.users ?? 0 >= 0 ? "+" : ""}${metricsData?.percentageChanges?.users ?? 0}%`,
            changeType: (metricsData?.percentageChanges?.users ?? 0) >= 0 ? "increase" : "decrease",
            icon: FiUsers,
            description: "Người mua và người bán",
            color: "bg-blue-500",
            isRevenue: false
        },
        {
            title: "Tin đăng hoạt động",
            value: (metricsData?.totalProducts ?? 0).toLocaleString(),
            change: `${metricsData?.percentageChanges?.products ?? 0 >= 0 ? "+" : ""}${metricsData?.percentageChanges?.products ?? 0}%`,
            changeType: (metricsData?.percentageChanges?.products ?? 0) >= 0 ? "increase" : "decrease",
            icon: FiShoppingBag,
            description: "Xe điện đang được bán",
            color: "bg-green-500",
            isRevenue: false
        },
        {
            title: "Tổng doanh thu",
            value: formatVND(totalRevenue),
            change: null,
            changeType: "increase",
            icon: FiDollarSign,
            description: "Đặt cọc xe và đăng kí gói",
            color: "bg-purple-500",
            isRevenue: true,
            details: {
                orders: orderRevenue,
                subscription: subscriptionRevenue,
                subscriptionCount: subscriptionData?.totalPurchases ?? 0
            }
        },
        {
            title: "Giao dịch thành công",
            value: ((metricsData?.totalOrders ?? 0) + (metricsData?.totalGHNOrders ?? 0)).toLocaleString(),
            change: null,
            changeType: "increase",
            icon: FiTrendingUp,
            description: "Đơn đã hoàn thành",
            color: "bg-orange-500",
            isRevenue: false,
            isTransaction: true,
            transactionDetails: {
                deposit: metricsData?.totalOrders ?? 0,
                ghn: metricsData?.totalGHNOrders ?? 0
            }
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
                        {metric.change && (
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${metric.changeType === "increase"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                                }`}>
                                {metric.change}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
                        <p className="text-sm font-medium text-gray-700">{metric.title}</p>
                        <p className="text-xs text-gray-500">{metric.description}</p>

                        {/* Hiển thị chi tiết cho card doanh thu */}
                        {metric.isRevenue && metric.details && (
                            <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-600">Đặt cọc xe và giao dịch hoàn tất :</span>
                                    <span className="font-semibold text-gray-900">{formatVND(metric.details.orders)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-600">Đăng kí gói:</span>
                                    <span className="font-semibold text-gray-900">{formatVND(metric.details.subscription)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs pt-1">
                                    <span className="text-indigo-600">Gói đã được đăng kí:</span>
                                    <span className="font-semibold text-indigo-600">{metric.details.subscriptionCount} gói</span>
                                </div>
                            </div>
                        )}

                        {/* Hiển thị chi tiết cho card giao dịch */}
                        {metric.isTransaction && metric.transactionDetails && (
                            <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-600">Đơn DEPOSIT:</span>
                                    <span className="font-semibold text-gray-900">{metric.transactionDetails.deposit} đơn</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-600">Đơn GHN:</span>
                                    <span className="font-semibold text-gray-900">{metric.transactionDetails.ghn} đơn</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
