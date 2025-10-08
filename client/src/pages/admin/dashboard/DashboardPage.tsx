import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FiDownload, FiRefreshCw, FiTrendingUp, FiGlobe, FiActivity } from "react-icons/fi";
import { RevenueChart } from "./components/RevenueChart";
import { TransactionChart } from "./components/TransactionChart";
import { PlatformMetrics } from "./components/PlatformMetrics";

export default function DashboardPage() {
    const [timeRange, setTimeRange] = useState("7d");

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                            <FiGlobe className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
                            <p className="text-gray-600 mt-1 flex items-center gap-2">
                                <FiTrendingUp className="w-4 h-4" /> Tổng quan nền tảng EV Marketplace
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

                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-4 py-2.5 font-medium"
                        >
                            <FiDownload className="w-4 h-4" /> Xuất báo cáo
                        </Button>

                        <Button
                            size="sm"
                            className="gap-2 bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-4 py-2.5 font-medium"
                        >
                            <FiRefreshCw className="w-4 h-4" /> Làm mới
                        </Button>
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
                                title="Doanh thu nền tảng"
                                description="Tổng quan doanh thu, hoa hồng và các giao dịch hoàn thành"
                            />
                        </div>
                    </div>

                    {/* Transaction Chart - Takes 1 column */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 h-full">
                            <TransactionChart
                                timeRange={timeRange}
                                title="Thống kê giao dịch"
                                description="Phân tích trạng thái các giao dịch trên nền tảng"
                            />
                        </div>
                    </div>
                </div>


                {/* Additional Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Platform Performance */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Hiệu suất nền tảng
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Các chỉ số quan trọng trong {timeRange === '7d' ? '7 ngày' : timeRange === '30d' ? '30 ngày' : timeRange === '90d' ? '3 tháng' : '1 năm'} qua
                                </p>
                            </div>
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <FiTrendingUp className="w-4 h-4 text-gray-600" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-xl">
                                <div className="text-2xl font-bold text-gray-900 mb-1">94.5%</div>
                                <div className="text-sm text-gray-600">Tỷ lệ giao dịch thành công</div>
                                <div className="text-xs text-green-600 mt-1">+2.3%</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-xl">
                                <div className="text-2xl font-bold text-gray-900 mb-1">4.8</div>
                                <div className="text-sm text-gray-600">Đánh giá trung bình</div>
                                <div className="text-xs text-green-600 mt-1">+0.2</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-xl">
                                <div className="text-2xl font-bold text-gray-900 mb-1">2.3 ngày</div>
                                <div className="text-sm text-gray-600">Thời gian bán TB</div>
                                <div className="text-xs text-green-600 mt-1">-0.5 ngày</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-xl">
                                <div className="text-2xl font-bold text-gray-900 mb-1">₫3.2M</div>
                                <div className="text-sm text-gray-600">Hoa hồng trung bình</div>
                                <div className="text-xs text-green-600 mt-1">+8.7%</div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Hoạt động gần đây
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Các sự kiện mới nhất trên nền tảng
                                </p>
                            </div>
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <FiActivity className="w-4 h-4 text-gray-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
