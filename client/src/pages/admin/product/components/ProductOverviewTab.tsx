import { Card, CardContent } from "@/components/ui/card";
import { FiUser, FiEye, FiHeart } from "react-icons/fi";
import type { Product } from "@/types/productType";
import { formatVND } from "@/utils/formatVND";

interface Props {
  product: Product;
}

export const ProductOverviewTab: React.FC<Props> = ({ product }) => {
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "vehicle": return "Xe điện";
      case "battery": return "Pin xe điện";
      default: return category;
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case "new": return "Mới";
      case "used": return "Đã sử dụng";
      case "refurbished": return "Tân trang";
      default: return condition;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Product Info */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 text-sm">Thông tin sản phẩm</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Giá:</span>
              <span className="font-bold text-green-600">{formatVND(product.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Danh mục:</span>
              <span className="text-right">{getCategoryLabel(product.category)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tình trạng:</span>
              <span className="text-right">{getConditionLabel(product.condition)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thương hiệu:</span>
              <span className="text-right">{product.brand}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Model:</span>
              <span className="text-right">{product.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Năm:</span>
              <span className="text-right">{product.year}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats & Seller */}
      <div className="space-y-4">
        {/* Stats */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-sm">Thống kê</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-blue-50 rounded">
                <FiEye className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <div className="font-bold text-sm">{product.views}</div>
                <div className="text-xs text-blue-600">Lượt xem</div>
              </div>
              <div className="text-center p-2 bg-rose-50 rounded">
                <FiHeart className="w-4 h-4 text-rose-600 mx-auto mb-1" />
                <div className="font-bold text-sm">{product.likes}</div>
                <div className="text-xs text-rose-600">Lượt thích</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seller */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <FiUser className="w-4 h-4" />
              Người bán
            </h3>
            {product.seller && typeof product.seller === "object" ? (
              <div className="space-y-2 text-sm">
                {"name" in product.seller && (
                  <div>
                    <span className="text-gray-600 block">Tên:</span>
                    <span className="font-medium break-words">{product.seller.name}</span>
                  </div>
                )}
                {"email" in product.seller && (
                  <div>
                    <span className="text-gray-600 block">Email:</span>
                    <span className="font-medium text-xs break-all">{product.seller.email}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Không có thông tin</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};