import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiActivity } from "react-icons/fi";
import { useTransactionStats } from "@/hooks/useAdmin";

ChartJS.register(ArcElement, Tooltip, Legend);

interface TransactionChartProps {
  title: string;
  description: string;
  timeRange: string;
}

export const TransactionChart: React.FC<TransactionChartProps> = ({ title, description, timeRange }) => {
  const { data: transactionStats, isLoading } = useTransactionStats(timeRange);

  // Lấy data từ API, fallback nếu null
  const transactionData = transactionStats || {
    categories: ['Chờ xử lý', 'Đã xác nhận', 'Đang vận chuyển', 'Đã giao', 'Đã hủy', 'Đã hoàn tiền'],
    values: [0, 0, 0, 0, 0, 0],
    total: 0,
    successRate: "0.0",
    totalValue: 0
  };

  const total = transactionData.total;
  const totalValue = transactionData.totalValue;

  // Chọn màu cho tối đa 6 category
  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#ef4444', '#9ca3af'];

  const data = {
    labels: transactionData.categories,
    datasets: [
      {
        data: transactionData.values,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context: import("chart.js").TooltipItem<'doughnut'>) => {
            const value = context.parsed;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%',
  };

  const successRate = transactionData.successRate;

  return (
    <Card className="border border-gray-200 shadow-sm bg-white h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-3 text-gray-900">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <FiActivity className="w-4 h-4 text-white" />
          </div>
          {title}
        </CardTitle>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Chart */}
        <div className="relative h-48 mb-6">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-2"></div>
                <span className="text-sm text-gray-600">Đang tải dữ liệu...</span>
              </div>
            </div>
          ) : (
            <>
              <Doughnut data={data} options={options} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{successRate}%</div>
                  <div className="text-xs text-gray-600">Tỷ lệ thành công</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Legend & Stats */}
        <div className="space-y-3">
          {transactionData.categories.map((category: string, index: number) => {
            const value = transactionData.values[index];
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index] }} />
                  <span className="text-sm font-medium text-gray-900">{category}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{value.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">{total.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Tổng giao dịch</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">₫{totalValue.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Tổng giá trị</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
