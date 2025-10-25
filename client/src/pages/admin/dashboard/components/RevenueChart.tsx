import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiDollarSign } from "react-icons/fi";
import { useRevenueData } from "@/hooks/useAdmin";
import { useState } from "react";
import { Input } from "@/components/ui/input";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueChartProps {
  title: string;
  description: string;
  timeRange?: string;
  startDate?: string;
  endDate?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ title, description, timeRange, startDate, endDate }) => {
  // Local state for date pickers
  const [localStartDate, setLocalStartDate] = useState(startDate || "");
  const [localEndDate, setLocalEndDate] = useState(endDate || "");
  const [filterParams, setFilterParams] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (timeRange) initial.range = timeRange;
    if (startDate) initial.startDate = startDate;
    if (endDate) initial.endDate = endDate;
    return initial;
  });

  // Only reload chart when user clicks 'Lọc'
  const handleFilter = () => {
    const params: Record<string, string> = {};
    if (timeRange) params.range = timeRange;
    if (localStartDate) params.startDate = localStartDate;
    if (localEndDate) params.endDate = localEndDate;
    setFilterParams(params);
  };

  const { data: apiData, isLoading } = useRevenueData(filterParams);
  // ...params and useRevenueData now handled above with localStartDate/localEndDate...

  // Fallback data for when API is not available
  const getFallbackData = (range?: string) => {
    switch (range) {
      case '7d':
        return {
          labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
          revenue: [125, 185, 155, 210, 175, 245, 195],
          orders: [45, 67, 52, 78, 63, 89, 71],
          growth: '+0%',
          summary: { totalRevenue: 1290, totalOrders: 465, avgOrderValue: 2.8 },
        };
      case '30d':
        return {
          labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
          revenue: [890, 1250, 1100, 1540],
          orders: [285, 412, 356, 523],
          growth: '+0%',
          summary: { totalRevenue: 4780, totalOrders: 1576, avgOrderValue: 3.0 },
        };
      case '90d':
        return {
          labels: ['Tháng 1', 'Tháng 2', 'Tháng 3'],
          revenue: [3200, 4100, 4850],
          orders: [1024, 1387, 1654],
          growth: '+0%',
          summary: { totalRevenue: 12150, totalOrders: 4065, avgOrderValue: 3.0 },
        };
      case '1y':
        return {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          revenue: [9200, 11500, 13800, 16200],
          orders: [3240, 4125, 4980, 5890],
          growth: '+0%',
          summary: { totalRevenue: 50700, totalOrders: 18235, avgOrderValue: 2.8 },
        };
      default:
        return {
          labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
          revenue: [125, 185, 155, 210, 175, 245, 195],
          orders: [45, 67, 52, 78, 63, 89, 71],
          growth: '+0%',
          summary: { totalRevenue: 1290, totalOrders: 465, avgOrderValue: 2.8 },
        };
    }
  };

  // Use API data if available, otherwise use fallback data
  let totalRevenue = 0;
  let totalOrders = 0;
  let growthDisplay = '+0%';
  let labels: string[] = [];
  let revenue: number[] = [];
  let orders: number[] = [];

  if (
    apiData &&
    typeof apiData === 'object' &&
    !Array.isArray(apiData) &&
    'labels' in apiData &&
    'revenue' in apiData &&
    'orders' in apiData &&
    'summary' in apiData &&
    'growth' in apiData
  ) {
    labels = apiData.labels as string[];
    revenue = apiData.revenue as number[];
    orders = apiData.orders as number[];
    totalRevenue = (apiData.summary)?.totalRevenue || 0;
    totalOrders = (apiData.summary)?.totalOrders || 0;
    growthDisplay = apiData.growth as string || '+0%';
  } else {
    // Use fallback
    const fallback = getFallbackData(timeRange);
    labels = fallback.labels;
    revenue = fallback.revenue;
    orders = fallback.orders;
    totalRevenue = fallback.summary?.totalRevenue || 0;
    totalOrders = fallback.summary?.totalOrders || 0;
    growthDisplay = fallback.growth || '+0%';
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Doanh thu (triệu VNĐ)',
        data: revenue,
        borderColor: '#1f2937',
        backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(31, 41, 55, 0.2)');
          gradient.addColorStop(1, 'rgba(31, 41, 55, 0.02)');
          return gradient;
        },
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#1f2937',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#1f2937',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 4,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context: { label: string }[]) => {
            return `${context[0].label}`;
          },
          label: (context: { parsed: { y: number }; dataIndex: number }) => {
            const revenueValue = context.parsed.y;
            const orderValue = orders?.[context.dataIndex] || 0;
            return [
              `Doanh thu: ${revenueValue} triệu VNĐ`,
              `Đơn hàng: ${orderValue} giao dịch`
            ];
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: '#e5e7eb',
          borderDash: [2, 2],
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: 500,
          },
          callback: (value: string | number) => `${value}M`,
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };
  console.log("Rendering RevenueChart with data:", { labels, revenue, orders, totalRevenue, totalOrders, growthDisplay });
  return (
    <Card className="border border-gray-200 shadow-sm bg-white h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-3 text-gray-900">
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                <FiDollarSign className="w-4 h-4 text-white" />
              </div>
              {title}
            </CardTitle>
            <p className="text-gray-600 text-sm mt-1">
              {description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Date Pickers + Filter Button */}
        <div className="flex gap-4 mb-4 items-center">
          <div className="flex flex-col">
            <label htmlFor="start-date" className="text-xs text-gray-600 mb-1">Từ ngày</label>
            <Input
              id="start-date"
              type="date"
              value={localStartDate}
              onChange={e => setLocalStartDate(e.target.value)}
              className="w-36"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="end-date" className="text-xs text-gray-600 mb-1">Đến ngày</label>
            <Input
              id="end-date"
              type="date"
              value={localEndDate}
              onChange={e => setLocalEndDate(e.target.value)}
              className="w-36"
            />
          </div>
          <button
            className="px-4 py-2 bg-gray-900 text-white rounded-lg ml-2 mt-5 h-10"
            onClick={handleFilter}
          >
            Lọc
          </button>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-600 font-medium mb-1">Tổng doanh thu</p>
            <p className="text-xl font-bold text-gray-900">
              {totalRevenue}M VNĐ
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-600 font-medium mb-1">Tổng giao dịch</p>
            <p className="text-xl font-bold text-gray-900">{totalOrders}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-64 bg-gray-50 rounded-xl p-4 border border-gray-100">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-2"></div>
                <span className="text-sm text-gray-600">Đang tải dữ liệu...</span>
              </div>
            </div>
          ) : (
            <Line data={data} options={options} />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
            <span className="text-sm text-gray-600 font-medium">Doanh thu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-gray-600 font-medium">Giao dịch</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};