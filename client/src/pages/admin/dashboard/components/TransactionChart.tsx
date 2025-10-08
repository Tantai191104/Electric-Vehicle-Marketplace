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

ChartJS.register(ArcElement, Tooltip, Legend);

interface TransactionChartProps {
  title: string;
  description: string;
  timeRange: string;
}

export const TransactionChart: React.FC<TransactionChartProps> = ({ title, description, timeRange }) => {
  const getTransactionData = (range: string) => {
    switch (range) {
      case '7d':
        return {
          categories: ['Thành công', 'Đang xử lý', 'Thất bại', 'Hủy bỏ'],
          values: [1892, 156, 89, 45],
          colors: ['#1f2937', '#6b7280', '#9ca3af', '#d1d5db']
        };
      case '30d':
        return {
          categories: ['Thành công', 'Đang xử lý', 'Thất bại', 'Hủy bỏ'],
          values: [7542, 634, 287, 156],
          colors: ['#1f2937', '#6b7280', '#9ca3af', '#d1d5db']
        };
      case '90d':
        return {
          categories: ['Thành công', 'Đang xử lý', 'Thất bại', 'Hủy bỏ'],
          values: [22340, 1890, 945, 567],
          colors: ['#1f2937', '#6b7280', '#9ca3af', '#d1d5db']
        };
      case '1y':
        return {
          categories: ['Thành công', 'Đang xử lý', 'Thất bại', 'Hủy bỏ'],
          values: [89750, 7634, 3245, 2156],
          colors: ['#1f2937', '#6b7280', '#9ca3af', '#d1d5db']
        };
      default:
        return {
          categories: ['Thành công', 'Đang xử lý', 'Thất bại', 'Hủy bỏ'],
          values: [1892, 156, 89, 45],
          colors: ['#1f2937', '#6b7280', '#9ca3af', '#d1d5db']
        };
    }
  };

  const transactionData = getTransactionData(timeRange);
  const total = transactionData.values.reduce((sum, val) => sum + val, 0);

  const data = {
    labels: transactionData.categories,
    datasets: [
      {
        data: transactionData.values,
        backgroundColor: transactionData.colors,
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
        callbacks: {
          label: (context: any) => {
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%',
  };

  const successRate = ((transactionData.values[0] / total) * 100).toFixed(1);

  return (
    <Card className="border border-gray-200 shadow-sm bg-white h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-3 text-gray-900">
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                <FiActivity className="w-4 h-4 text-white" />
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
        {/* Chart */}
        <div className="relative h-48 mb-6">
          <Doughnut data={data} options={options} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{successRate}%</div>
              <div className="text-xs text-gray-600">Tỷ lệ thành công</div>
            </div>
          </div>
        </div>

        {/* Legend & Stats */}
        <div className="space-y-3">
          {transactionData.categories.map((category, index) => {
            const value = transactionData.values[index];
            const percentage = ((value / total) * 100).toFixed(1);
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: transactionData.colors[index] }}
                  />
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
              <div className="text-lg font-bold text-gray-900">₫{(total * 1.2).toLocaleString()}M</div>
              <div className="text-xs text-gray-600">Tổng giá trị</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};