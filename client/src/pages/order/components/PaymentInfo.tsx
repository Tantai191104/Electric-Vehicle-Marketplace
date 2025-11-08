import React from "react";
import type { Order } from "@/types/orderType";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatNumberWithDots } from "@/utils/numberFormatter";
import { FiCreditCard } from "react-icons/fi";
import { MdPayment } from "react-icons/md";

interface PaymentInfoProps {
  order: Order;
  isGHNOrder: boolean;
  isDepositOrder: boolean;
}

const PaymentInfo: React.FC<PaymentInfoProps> = ({ order, isGHNOrder, isDepositOrder }) => {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-black flex items-center gap-2">
        <MdPayment className="w-4 h-4" />
        Thanh toán
      </h4>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">Phương thức:</span>
          <div className="flex items-center gap-1">
            <FiCreditCard className="w-4 h-4" />
            <span className="font-medium text-black">
              {order.payment.method === "wallet" ? "Ví hệ thống" :
                order.payment.method === "vnpay" ? "VNPay" :
                  order.payment.method === "zalopay" ? "ZaloPay" :
                    order.payment.method === "bank_transfer" ? "Chuyển khoản" : "COD"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">Trạng thái:</span>
          <Badge className={order.payment.status === "paid" ? "bg-black text-white" : "bg-gray-100 text-gray-700"}>
            {order.payment.status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
          </Badge>
        </div>

        {isGHNOrder && (
          <div className="space-y-1 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>{formatNumberWithDots(order.totalAmount)} VNĐ</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Phí vận chuyển:</span>
              <span>{formatNumberWithDots(order.shippingFee)} VNĐ</span>
            </div>
          </div>
        )}

        {isDepositOrder && (
          <div className="space-y-1 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Phí đặt cọc:</span>
              <span>{formatNumberWithDots(order.finalAmount)} VNĐ</span>
            </div>
          </div>
        )}

        <Separator className="bg-gray-300" />
        <div className="flex items-center justify-between">
          <span className="font-semibold text-black">Tổng thanh toán:</span>
          <span className="text-xl font-bold text-black">{formatNumberWithDots(isGHNOrder ? order.totalAmount : order.finalAmount)} VNĐ</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfo;
