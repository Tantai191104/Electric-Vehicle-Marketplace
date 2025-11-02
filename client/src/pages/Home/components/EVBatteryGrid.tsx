import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBatteryProducts } from "@/hooks/useProduct";
import { formatNumberWithDots } from "@/utils/numberFormatter";
import { getConditionLabel } from "@/utils/productHelper";
import type { Product } from "@/types/productType";
import { BiErrorCircle } from "react-icons/bi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { Crown, Battery, Zap } from "lucide-react";

export default function EVBatteryGrid() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useBatteryProducts({ page: 1, limit: 8 });

  // Loading state
  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-2 py-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-yellow-900">
            Phụ kiện xe điện nổi bật
          </h2>
        </div>
        <div className="text-center py-12">
          <AiOutlineLoading3Quarters className="w-8 h-8 mx-auto mb-4 text-yellow-500 animate-spin" />
          <p className="text-gray-600">Đang tải pin điện...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-2 py-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-yellow-900">
            Pin xe điện cũ
          </h2>
        </div>
        <div className="text-center py-12">
          <BiErrorCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không thể tải dữ liệu
          </h3>
          <p className="text-gray-600 mb-4">
            Có lỗi xảy ra khi tải danh sách phụ kiện
          </p>
        </div>
      </section>
    );
  }

  // Sort by priority before slicing
  const products = (data?.products || [])
    .sort((a: Product, b: Product) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priorityLevel as keyof typeof priorityOrder] || 99;
      const bPriority = priorityOrder[b.priorityLevel as keyof typeof priorityOrder] || 99;
      return aPriority - bPriority; // "high" first
    })
    .slice(0, 8);

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Pin xe điện
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {products.length} sản phẩm nổi bật
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/batteries")}
          className="rounded-full border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white font-medium px-6 transition-all"
        >
          Xem tất cả →
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <Battery className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có sản phẩm
          </h3>
          <p className="text-gray-500">
            Hãy quay lại sau để xem sản phẩm mới
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product: Product) => {
            const isHighPriority = product.priorityLevel === "high" || product.isPriorityBoosted === true;
            
            return (
              <Card
                onClick={() => navigate(`/detail/${product._id}`)}
                key={product._id}
                className={`group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                  isHighPriority 
                    ? "border-2 border-blue-400 shadow-lg shadow-blue-200/50 ring-2 ring-blue-300/30" 
                    : "border border-gray-200 hover:border-blue-300"
                }`}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50">
                  <img
                    src={product.images[0] || "/images/placeholder.jpg"}
                    alt={`${product.brand} ${product.model}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Priority Badge */}
                  {isHighPriority && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-md flex items-center gap-1 animate-pulse">
                        <Crown className="w-3 h-3" />
                        Ưu tiên
                      </Badge>
                    </div>
                  )}
                  
                  {/* Condition Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm border-0 shadow-sm">
                      {getConditionLabel(product.condition)}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-blue-600 transition-colors">
                    {product.title || `${product.brand} ${product.model}`}
                  </h3>

                  {/* Specs */}
                  <div className="space-y-1 mb-3 text-sm text-gray-600">
                    {product.specifications?.voltage && (
                      <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-cyan-500" />
                        <span>{product.specifications.voltage}</span>
                      </div>
                    )}
                    {product.specifications?.capacity && (
                      <div className="flex items-center gap-2">
                        <Battery className="w-3.5 h-3.5 text-blue-500" />
                        <span>{product.specifications.capacity}</span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className={`text-xl font-bold ${
                    isHighPriority 
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent" 
                      : "text-blue-600"
                  }`}>
                    {formatNumberWithDots(product.price)} đ
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
