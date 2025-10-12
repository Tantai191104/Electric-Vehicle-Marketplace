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
import { Badge } from "@/components/ui/badge";
import { FiTrendingUp, FiDollarSign } from "react-icons/fi";
import { useRevenueData } from "@/hooks/useAdmin";

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
  timeRange: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ title, description, timeRange }) => {
  const { data: revenueData, isLoading } = useRevenueData(timeRange);

  // Fallback data for when API is not available
  const getFallbackData = (range: string) => {
    switch (range) {
      case '7d':
        return [
          { date: 'T2', revenue: 125, orders: 45 },
          { date: 'T3', revenue: 185, orders: 67 },
          { date: 'T4', revenue: 155, orders: 52 },
          { date: 'T5', revenue: 210, orders: 78 },
          { date: 'T6', revenue: 175, orders: 63 },
          { date: 'T7', revenue: 245, orders: 89 },
          { date: 'CN', revenue: 195, orders: 71 },
        ];
      case '30d':
        return [
          { date: 'Tuần 1', revenue: 890, orders: 285 },
          { date: 'Tuần 2', revenue: 1250, orders: 412 },
          { date: 'Tuần 3', revenue: 1100, orders: 356 },
          { date: 'Tuần 4', revenue: 1540, orders: 523 },
        ];
      case '90d':
        return [
          { date: 'Tháng 1', revenue: 3200, orders: 1024 },
          { date: 'Tháng 2', revenue: 4100, orders: 1387 },
          { date: 'Tháng 3', revenue: 4850, orders: 1654 },
        ];
      case '1y':
        return [
          { date: 'Q1', revenue: 9200, orders: 3240 },
          { date: 'Q2', revenue: 11500, orders: 4125 },
          { date: 'Q3', revenue: 13800, orders: 4980 },
          { date: 'Q4', revenue: 16200, orders: 5890 },
        ];
      default:
        return [
          { date: 'T2', revenue: 125, orders: 45 },
          { date: 'T3', revenue: 185, orders: 67 },
          { date: 'T4', revenue: 155, orders: 52 },
          { date: 'T5', revenue: 210, orders: 78 },
          { date: 'T6', revenue: 175, orders: 63 },
          { date: 'T7', revenue: 245, orders: 89 },
          { date: 'CN', revenue: 195, orders: 71 },
        ];
    }
  };

  // Use API data if available, otherwise use fallback data
  const chartData = revenueData || getFallbackData(timeRange);
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);

  // Calculate growth rate (simplified - comparing first and last values)
  const growthRate = chartData.length > 1
    ? (((chartData[chartData.length - 1].revenue - chartData[0].revenue) / chartData[0].revenue) * 100).toFixed(1)
    : '0.0';
  const growthDisplay = `${parseFloat(growthRate) >= 0 ? '+' : ''}${growthRate}%`;

  const data = {
    labels: chartData.map(item => item.date),
    datasets: [
      {
        label: 'Doanh thu (triệu VNĐ)',
        data: chartData.map(item => item.revenue),
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
            const orderValue = chartData[context.dataIndex].orders;
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
          <Badge className="gap-1 bg-gray-900 text-white border-gray-900">
            <FiTrendingUp className="w-3 h-3" />
            {growthDisplay}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
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