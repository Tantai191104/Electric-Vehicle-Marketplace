import React from "react";
import type { Order } from "@/types/orderType";
import { Badge } from "@/components/ui/badge";
import { formatNumberWithDots } from "@/utils/numberFormatter";

interface OrderItemProps {
  order: Order;
}

const OrderItem: React.FC<OrderItemProps> = ({ order }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
        <img
          src={typeof order.productId === 'object' ? (order.productId.images?.[0] || "/images/placeholder.jpg") : "/images/placeholder.jpg"}
          alt={typeof order.productId === 'object' ? order.productId.title : "Sản phẩm"}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-black truncate">
          {typeof order.productId === 'object' ? order.productId.title : "Sản phẩm"}
        </h4>
        <div className="flex items-center gap-4 text-sm text-gray-700 mt-1">
          <span>Số lượng: {order.quantity}</span>
          <span className="font-semibold text-black">{formatNumberWithDots(order.unitPrice)} VNĐ</span>
        </div>
        <div className="text-sm text-gray-600 mt-1">Người bán: {typeof order.sellerId === 'object' ? order.sellerId.name : "N/A"}</div>
      </div>

      <Badge variant="outline" className="shrink-0 border-gray-300 text-gray-700">Sản phẩm</Badge>
    </div>
  );
};

export default OrderItem;
