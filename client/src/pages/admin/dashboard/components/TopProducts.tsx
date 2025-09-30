import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiTrendingUp, FiEye, FiHeart, FiShoppingCart } from "react-icons/fi";

export const TopProducts: React.FC = () => {
  const topProducts = [
    {
      id: 1,
      name: "VinFast VF8",
      category: "Xe điện",
      price: 1200000000,
      sales: 45,
      views: 2150,
      likes: 189,
      image: "/api/placeholder/60/60",
      trend: "up"
    },
    {
      id: 2,
      name: "Pin Lithium 72V 20Ah",
      category: "Phụ kiện",
      price: 15000000,
      sales: 128,
      views: 1890,
      likes: 156,
      image: "/api/placeholder/60/60",
      trend: "up"
    },
    {
      id: 3,
      name: "Honda PCX Electric",
      category: "Xe máy điện",
      price: 85000000,
      sales: 32,
      views: 1456,
      likes: 142,
      image: "/api/placeholder/60/60",
      trend: "down"
    },
    {
      id: 4,
      name: "Sạc nhanh DC 22kW",
      category: "Sạc xe",
      price: 45000000,
      sales: 67,
      views: 1234,
      likes: 98,
      image: "/api/placeholder/60/60",
      trend: "up"
    }
  ];

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-r from-rose-500 to-pink-600 flex items-center justify-center">
            <FiTrendingUp className="w-3 h-3 text-white" />
          </div>
          Sản phẩm hàng đầu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topProducts.map((product, index) => (
          <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
              </div>
              {product.trend === 'up' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <FiTrendingUp className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{product.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
                <span className="text-xs text-gray-600">
                  {new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(product.price)} VNĐ
                </span>
              </div>
              
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <FiShoppingCart className="w-3 h-3" />
                  {product.sales}
                </div>
                <div className="flex items-center gap-1">
                  <FiEye className="w-3 h-3" />
                  {product.views}
                </div>
                <div className="flex items-center gap-1">
                  <FiHeart className="w-3 h-3" />
                  {product.likes}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};