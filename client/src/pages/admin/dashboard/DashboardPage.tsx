import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    FiDownload,
    FiRefreshCw
} from "react-icons/fi";
import { StatsOverview } from "./components/StatsOverview";
import { RevenueChart } from "./components/RevenueChart";
import { QuickActions } from "./components/QuickActions";
import { TopProducts } from "./components/TopProducts";
import { RecentActivities } from "./components/RecentActivities";
import { ProductsChart } from "./components/ProductsChart";
import { UserAnalytics } from "./components/UserAnalytics";

export default function DashboardPage() {
    const [timeRange, setTimeRange] = useState("7d");

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Dashboard
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Tổng quan hiệu suất Electric Vehicle Marketplace
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm transition-all duration-200"
                        >
                            <option value="7d">7 ngày qua</option>
                            <option value="30d">30 ngày qua</option>
                            <option value="90d">3 tháng qua</option>
                            <option value="1y">1 năm qua</option>
                        </select>

                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                        >
                            <FiDownload className="w-4 h-4" />
                            Xuất báo cáo
                        </Button>

                        <Button
                            size="sm"
                            className="gap-2 bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <FiRefreshCw className="w-4 h-4" />
                            Làm mới
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <StatsOverview timeRange={timeRange} />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Left Column - Charts */}
                    <div className="xl:col-span-8 space-y-6">
                        {/* Revenue Chart */}
                        <RevenueChart timeRange={timeRange} />

                        {/* Products Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ProductsChart timeRange={timeRange} />
                            <UserAnalytics timeRange={timeRange} />
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="xl:col-span-4 space-y-6">
                        <QuickActions />
                        <TopProducts />
                        <RecentActivities />
                    </div>
                </div>

            </div>
        </div>
    );
}