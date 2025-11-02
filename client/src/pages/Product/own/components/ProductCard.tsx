import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FiMoreVertical,
  FiEdit,
  FiEye,
  FiEyeOff,
  FiHeart,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiStar,
} from "react-icons/fi";
import type { Product } from "@/types/productType";
import { formatVND } from "@/utils/formatVND";

interface Props {
  product: Product;
  onEdit: (product: Product) => void;
  onView: (product: Product) => void;
}

export const ProductCard: React.FC<Props> = ({
  product,
  onEdit,
  onView
}) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return {
          label: "Đang hiển thị",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: FiCheckCircle
        };
      case "pending":
        return {
          label: "Chờ duyệt",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: FiClock
        };
      case "inactive":
        return {
          label: "Tạm ẩn",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: FiEyeOff
        };
      case "sold":
        return {
          label: "Đã bán",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: FiCheckCircle
        };
      case "rejected":
        return {
          label: "Bị từ chối",
          color: "bg-red-100 text-red-800 border-red-200",
          icon: FiXCircle
        };
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: FiXCircle
        };
    }
  };

  const statusInfo = getStatusInfo(product.status);
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white overflow-hidden">
      <div className="relative">
        {/* Product Image */}
        <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiEye className="w-12 h-12 text-gray-300" />
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`${statusInfo.color} flex items-center gap-1 text-xs`}>
            <StatusIcon className="w-3 h-3" />
            {statusInfo.label}
          </Badge>
        </div>

        {/* Featured Badge */}
        {product.isFeatured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-yellow-400 text-yellow-900 flex items-center gap-1 text-xs">
              <FiStar className="w-3 h-3" />
              Nổi bật
            </Badge>
          </div>
        )}

        {/* Actions Menu */}
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-white/80 hover:bg-white shadow-sm"
              >
                <FiMoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onView(product)}>
                  <FiEye className="w-4 h-4 mr-2" />
                  Xem chi tiết
                </DropdownMenuItem>

                {/* Allow edit only when product is pending */}
                {product.status === "pending" && (
                  <DropdownMenuItem onClick={() => onEdit(product)}>
                    <FiEdit className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Title & Price */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
            {product.title}
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatVND(product.price)}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <FiEye className="w-4 h-4" />
              <span>{product.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <FiHeart className="w-4 h-4" />
              <span>{product.likes}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <FiCalendar className="w-3 h-3" />
            <span>{new Date(product.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        {/* Category & Condition */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {product.category === "vehicle" ? "Xe điện" :
              product.category === "battery" ? "Pin" :
                product.category === "charger" ? "Sạc" : "Phụ kiện"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {product.condition === "new" ? "Mới" :
              product.condition === "used" ? "Đã sử dụng" : "Tân trang"}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {product.description}
        </p>

        {/* Action Buttons: only allow edit for pending products, view always */}
        <div className="flex gap-2">
          {product.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(product)}
              className="flex-1"
            >
              <FiEdit className="w-4 h-4 mr-1" />
              Sửa
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(product)}
            className="flex-1"
          >
            <FiEye className="w-4 h-4 mr-1" />
            Xem
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};