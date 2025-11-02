import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBatteryProducts } from "@/hooks/useProduct";
import { formatNumberWithDots } from "@/utils/numberFormatter";
import { getConditionLabel } from "@/utils/productHelper";
import type { Product } from "@/types/productType";
import { BiErrorCircle } from "react-icons/bi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import truncate from "@/utils/truncate";
import { useNavigate } from "react-router-dom";

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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải dữ liệu</h3>
          <p className="text-gray-600 mb-4">Có lỗi xảy ra khi tải danh sách phụ kiện</p>
        </div>
      </section>
    );
  }

  const products = (data?.products || []).slice(0, 8);

  return (
    <section className="max-w-7xl mx-auto px-2 py-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-yellow-900">
            Pin xe điện cũ
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Hiển thị {products.length} sản phẩm pin xe điện
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/batteries")}
          className="rounded-full border-black text-black font-semibold px-6 py-2 hover:bg-black hover:text-white transition"
        >
          Xem thêm &rarr;
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <BiErrorCircle className="w-10 h-10 text-gray-400" />
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
              className="overflow-hidden shadow-md hover:shadow-xl transition-all rounded-2xl border border-yellow-100 bg-white cursor-pointer"
            >
              <img
                src={product.images[0] || "/images/placeholder.jpg"}
                alt={`${product.brand} ${product.model}`}
                className="w-full h-40 object-cover rounded-t-2xl"
                loading="lazy"
              />
              <div className="p-4">
                <div className="text-base font-bold text-yellow-900 mb-1 truncate">
                  {product.brand} {product.model}
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  {truncate(product.description, 50)}
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  <span className="font-medium text-yellow-700">Pin xe điện</span>
                </div>
                <div className="text-base font-bold text-yellow-700 mt-2">
                  {formatNumberWithDots(product.price)} VNĐ
                </div>
                <div className="mt-2">
                  <span className="inline-block bg-yellow-100 text-yellow-900 font-semibold px-3 py-1 rounded-full text-xs">
                    {getConditionLabel(product.condition)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}