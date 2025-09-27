import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { formatNumberWithDots } from "@/utils/numberFormatter";
import { useProducts } from "@/hooks/useProduct";
import { getConditionLabel, getProductType } from "@/utils/productHelper";
import type { Product } from "@/types/productType";
import { FiEye, FiHeart, FiCalendar } from "react-icons/fi";
import { BiErrorCircle } from "react-icons/bi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";


export default function EVProductGrid() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useProducts({
    page: 1,
    limit: 8,
    category: "vehicle"
  });
  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-2 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-yellow-900">
            Khám phá xe điện nổi bật
          </h2>
        </div>
        <div className="text-center py-12">
          <AiOutlineLoading3Quarters className="w-8 h-8 mx-auto mb-4 text-yellow-500 animate-spin" />
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-2 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-yellow-900">
            Khám phá xe điện nổi bật
          </h2>
        </div>
        <div className="text-center py-12">
          <BiErrorCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải dữ liệu</h3>
          <p className="text-gray-600 mb-4">Có lỗi xảy ra khi tải danh sách sản phẩm</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
            Thử lại
          </Button>
        </div>
      </section>
    );
  }
  const products = data?.products || [];

  return (
    <section className="max-w-7xl mx-auto px-2 py-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-yellow-900">
            Khám phá xe điện nổi bật
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Hiển thị {products.length} sản phẩm mới nhất
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="rounded-full border-black text-black font-semibold px-6 py-2 hover:bg-black hover:text-white transition"
        >
          <Link to="/cars">Xem thêm &rarr;</Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FiCalendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có sản phẩm nào</h3>
          <p className="text-gray-600">Hãy quay lại sau để xem các sản phẩm mới</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: Product) => (
            <Card
              onClick={() => navigate(`/detail/${product._id}`)}
              key={product._id}
              className="overflow-hidden shadow-md hover:shadow-xl transition-all rounded-2xl border border-yellow-100 bg-white group cursor-pointer"
            >
              <CardHeader className="p-0 relative">
                <img
                  src={product.images[0] || "/images/placeholder.jpg"}
                  alt={product.title}
                  className="w-full h-40 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-md shadow">
                  {getConditionLabel(product.condition)}
                </span>
                {product.isFeatured && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow">
                    Nổi bật
                  </span>
                )}
              </CardHeader>
              <CardContent className="p-4 flex flex-col justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-yellow-900 mb-1 line-clamp-1">
                    {product.brand} {product.model}
                  </CardTitle>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                      {getProductType(product.category)}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600">
                      <FiCalendar className="w-3 h-3" />
                      {product.year}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-yellow-600 mb-3">
                    {formatNumberWithDots(product.price)} VNĐ
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                      <FiEye className="w-3 h-3" />
                      <span className="font-medium">{product.views}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-full">
                      <FiHeart className="w-3 h-3" />
                      <span className="font-medium">{product.likes}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
