import { useState } from "react";
import { FiTrendingUp, FiGlobe } from "react-icons/fi";
import { RevenueChart } from "./components/RevenueChart";
import { TransactionChart } from "./components/TransactionChart";
import { PlatformMetrics } from "./components/PlatformMetrics";

export default function DashboardPage() {
    const [timeRange, setTimeRange] = useState("7d");

    return (
        <div className="h-screen overflow-y-auto bg-gray-50">
            <div className="p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                                <FiGlobe className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển xe điện</h1>
                                <p className="text-gray-600 mt-1 flex items-center gap-2">
                                    <FiTrendingUp className="w-4 h-4" /> Tổng quan nền tảng mua bán xe điện & pin cũ
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm font-medium transition-all duration-200"
                            >
                                <option value="7d">7 ngày qua</option>
                                <option value="30d">30 ngày qua</option>
                                <option value="90d">3 tháng qua</option>
                                <option value="1y">1 năm qua</option>
                            </select>
                        </div>
                    </div>

                    <PlatformMetrics timeRange={timeRange} />

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Revenue Chart - Takes 2 columns */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl p-6 h-full">
                                <RevenueChart
                                    timeRange={timeRange}
                                    title="Doanh thu giao dịch xe & pin"
                                    description="Tổng quan doanh thu từ xe điện cũ, pin xe điện và hoa hồng"
                                />
                            </div>
                        </div>

                        {/* Transaction Chart - Takes 1 column */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl p-6 h-full">
                                <TransactionChart
                                    timeRange={timeRange}
                                    title="Giao dịch xe & pin"
                                    description="Phân tích trạng thái giao dịch xe điện và pin cũ"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
