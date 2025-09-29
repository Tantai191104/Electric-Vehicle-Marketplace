import React from "react";
import { FiShoppingCart } from "react-icons/fi";

export const OrderHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-2xl mb-4 shadow-lg">
          <FiShoppingCart className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Đơn hàng của tôi
        </h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Theo dõi và quản lý tất cả đơn hàng của bạn
        </p>
      </div>
    </div>
  );
};