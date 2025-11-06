import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { formatNumberWithDots } from "@/utils/numberFormatter";
import { useVehicleProducts } from "@/hooks/useProduct";
import { getConditionLabel, getProductType } from "@/utils/productHelper";
import type { Product } from "@/types/productType";
import { FiEye, FiHeart, FiCalendar } from "react-icons/fi";
import { BiErrorCircle } from "react-icons/bi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Crown } from "lucide-react";

export default function EVProductGrid() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useVehicleProducts({ page: 1, limit: 8 });

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-2 py-10">
        <h2 className="text-2xl font-bold text-amber-800 mb-6 text-center">
          Khám phá xe điện nổi bật
        </h2>
        <div className="text-center py-10">
          <AiOutlineLoading3Quarters className="w-8 h-8 mx-auto mb-3 text-amber-500 animate-spin" />
          <p className="text-gray-500">Đang tải sản phẩm...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-2 py-10">
        <h2 className="text-2xl font-bold text-amber-800 mb-6 text-center">
          Khám phá xe điện nổi bật
        </h2>
        <div className="text-center py-10">
          <BiErrorCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không thể tải dữ liệu
          </h3>
          <p className="text-gray-600 mb-4">
            Có lỗi xảy ra khi tải danh sách sản phẩm
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            Thử lại
          </Button>
        </div>
      </section>
    );
  }

  // Sort by priority (high -> medium -> low), then take first 8
  const products = (data?.products || [])
    .slice() // clone to avoid mutating original
    .sort((a: Product, b: Product) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 } as Record<string, number>;
      const aPriority = priorityOrder[a.priorityLevel as keyof typeof priorityOrder] || 99;
      const bPriority = priorityOrder[b.priorityLevel as keyof typeof priorityOrder] || 99;
      return aPriority - bPriority;
    })
    .slice(0, 8);

  return (
    <section className="max-w-7xl mx-auto px-2 py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-amber-900">
            Khám phá xe điện nổi bật
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Hiển thị {products.length} sản phẩm mới nhất
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="rounded-full border-gray-800 text-gray-800 font-semibold px-6 py-2 hover:bg-gray-800 hover:text-white transition"
        >
          <Link to="/cars">Xem thêm &rarr;</Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FiCalendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có sản phẩm nào
          </h3>
          <p className="text-gray-600">
            Hãy quay lại sau để xem các sản phẩm mới
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: Product) => {
            const isHighPriority = product.priorityLevel === "high";
            const isLowPriority = product.priorityLevel === "low";

            return (
              <Card
                onClick={() => navigate(`/detail/${product._id}`)}
                key={product._id}
                className={`overflow-hidden rounded-2xl group cursor-pointer transition-all duration-300 ${isHighPriority
                  ? "bg-gradient-to-br from-amber-50 to-amber-100 border-0 shadow-2xl hover:-translate-y-1 hover:shadow-2xl"
                  : isLowPriority
                    ? "bg-white border-black text-black shadow-sm hover:shadow-md"
                    : "bg-white border-gray-100 hover:border-amber-300 shadow-sm hover:shadow-lg"
                  }`}>
                {/* Image */}
                <CardHeader className="p-0 relative">
                  <img
                    src={product.images[0] || "/images/placeholder.jpg"}
                    alt={product.title}
                    className="w-full h-44 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {isHighPriority && (
                    <>
                      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-amber-400 to-amber-600" />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-lg flex items-center gap-2 rounded-full px-3 py-1">
                          <Crown className="w-3 h-3" />
                          Ưu tiên
                        </Badge>
                      </div>
                    </>
                  )}

                  {/* Condition Badge */}
                  <Badge className="absolute top-3 left-3 bg-white/80 text-gray-800 border border-gray-200 backdrop-blur-sm font-medium px-2 py-1 rounded-md">
                    {getConditionLabel(product.condition)}
                  </Badge>
                </CardHeader>

                <CardContent className="p-4 flex flex-col justify-between">
                  <div>
                    <CardTitle className={`text-base font-bold mb-1 line-clamp-1 ${isLowPriority ? 'text-black' : 'text-gray-900'}`}>
                      {product.brand} {product.model}
                    </CardTitle>

                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                        {getProductType(product.category)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        {product.year}
                      </span>
                    </div>

                    <div className={`text-lg font-bold mb-3 ${isHighPriority ? 'text-amber-600' : isLowPriority ? 'text-black' : 'text-gray-800'}`}>
                      {formatNumberWithDots(product.price)} VNĐ
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                        <FiEye className="w-3 h-3" />
                        <span>{product.views}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        <FiHeart className="w-3 h-3" />
                        <span>{product.likes}</span>
                      </div>
                    </div>

                    {isHighPriority && (
                      <div className="mt-2 text-xs text-amber-600 font-medium flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        <span>Được đẩy ưu tiên</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
