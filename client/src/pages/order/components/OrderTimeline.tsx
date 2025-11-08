import React from "react";
import type { Order } from "@/types/orderType";
import { Badge } from "@/components/ui/badge";
import { FiClock } from "react-icons/fi";

interface OrderTimelineProps {
  timeline?: Order["timeline"] | null;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <h4 className="font-semibold text-black mb-3 flex items-center gap-2">
        <FiClock className="w-4 h-4" />
        Lịch sử đơn hàng
      </h4>
      <div className="space-y-2">
        {timeline.map((t) => (
          <div key={t._id} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-2 h-2 bg-gray-600 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black">{t.description}</p>
              <p className="text-xs text-gray-600">{new Date(t.timestamp).toLocaleString('vi-VN')}</p>
            </div>
            <Badge className={`text-xs font-semibold border ${getStatusBadgeClass(t.status)}`}>
              {getStatusLabel(t.status)}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

// Local helpers copied from OrderCard to avoid circular imports
function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Chờ xử lý',
    'deposit': 'Chờ xử lý',
    'scheduled': 'Đã lên lịch',
    'confirmed': 'Đã xác nhận',
    'shipping': 'Đang giao',
    'delivered': 'Đã giao',
    'cancelled': 'Đã hủy',
    'refunded': 'Đã hoàn tiền',
    'paid': 'Đã thanh toán',
    'unpaid': 'Chưa thanh toán',
    'processing': 'Đang xử lý',
    'completed': 'Hoàn thành'
  };
  return statusMap[status.toLowerCase()] || status;
}

function getStatusBadgeClass(status: string): string {
  const colorMap: Record<string, string> = {
    'pending': 'bg-gray-100 text-gray-700 border-gray-300',
    'scheduled': 'bg-green-100 text-green-700 border-green-300',
    'deposit': 'bg-gray-100 text-gray-700 border-gray-300',
    'confirmed': 'bg-blue-100 text-blue-700 border-blue-300',
    'shipping': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'delivered': 'bg-green-100 text-green-700 border-green-300',
    'cancelled': 'bg-red-100 text-red-700 border-red-300',
    'refunded': 'bg-purple-100 text-purple-700 border-purple-300',
    'paid': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'unpaid': 'bg-orange-100 text-orange-700 border-orange-300',
    'processing': 'bg-indigo-100 text-indigo-700 border-indigo-300',
    'completed': 'bg-teal-100 text-teal-700 border-teal-300'
  };
  return colorMap[status.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-300';
}

export default OrderTimeline;
