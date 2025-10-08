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
  // Mock data based on timeRange
  const getChartData = (range: string) => {
    switch (range) {
      case '7d':
        return {
          labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
          revenue: [125, 185, 155, 210, 175, 245, 195],
          orders: [45, 67, 52, 78, 63, 89, 71],
          growth: '+12.5%'
        };
      case '30d':
        return {
          labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
          revenue: [890, 1250, 1100, 1540],
          orders: [285, 412, 356, 523],
          growth: '+18.3%'
        };
      case '90d':
        return {
          labels: ['Tháng 1', 'Tháng 2', 'Tháng 3'],
          revenue: [3200, 4100, 4850],
          orders: [1024, 1387, 1654],
          growth: '+23.7%'
        };
      case '1y':
        return {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          revenue: [9200, 11500, 13800, 16200],
          orders: [3240, 4125, 4980, 5890],
          growth: '+28.5%'
        };
      default:
        return {
          labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
          revenue: [125, 185, 155, 210, 175, 245, 195],
          orders: [45, 67, 52, 78, 63, 89, 71],
          growth: '+12.5%'
        };
    }
  };

  const chartData = getChartData(timeRange);
  const totalRevenue = chartData.revenue.reduce((sum, val) => sum + val, 0);
  const totalOrders = chartData.orders.reduce((sum, val) => sum + val, 0);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Doanh thu (triệu VNĐ)',
        data: chartData.revenue,
        borderColor: '#1f2937',
        backgroundColor: (context: any) => {
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
          title: (context: any) => {
            return `${context[0].label}`;
          },
          label: (context: any) => {
            const revenueValue = context.parsed.y;
            const orderValue = chartData.orders[context.dataIndex];
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
          callback: (value: any) => `${value}M`,
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
            {chartData.growth}
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
          <Line data={data} options={options} />
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