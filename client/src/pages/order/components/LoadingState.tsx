import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto pt-32 px-4 text-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AiOutlineLoading3Quarters className="w-8 h-8 text-gray-600 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Đang tải đơn hàng</h2>
          <p className="text-gray-600">Vui lòng chờ trong giây lát...</p>
        </div>
      </div>
    </div>
  );
};