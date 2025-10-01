import React from "react";
import { Button } from "@/components/ui/button";
import { FiShoppingCart } from "react-icons/fi";

interface EmptyStateProps {
  activeTab: string;
  navigate: (path: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ activeTab, navigate }) => {
  const getEmptyMessage = () => {
    switch (activeTab) {
      case "pending": return "Không có đơn hàng nào đang chờ xử lý";
      case "processing": return "Không có đơn hàng nào đang được xử lý";
      case "shipping": return "Không có đơn hàng nào đang được giao";
      case "delivered": return "Không có đơn hàng nào đã được giao";
      default: return "Bạn chưa có đơn hàng nào";
    }
  };

  return (
    <div className="text-center py-16">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-12 max-w-lg mx-auto">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <FiShoppingCart className="w-12 h-12 text-gray-600" />
        </div>

        <h2 className="text-2xl font-bold text-black mb-3">
          {getEmptyMessage()}
        </h2>

        <p className="text-gray-700 mb-8 leading-relaxed">
          {activeTab === "all"
            ? "Khám phá những sản phẩm tuyệt vời và đặt hàng ngay hôm nay!"
            : "Hãy kiểm tra các tab khác để xem đơn hàng của bạn."
          }
        </p>

        {activeTab === "all" && (
          <div className="space-y-4">
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              🛒 Mua sắm ngay
            </Button>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <span>•</span>
              <span>Giao hàng nhanh</span>
              <span>•</span>
              <span>Bảo hành uy tín</span>
              <span>•</span>
              <span>Hỗ trợ 24/7</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};