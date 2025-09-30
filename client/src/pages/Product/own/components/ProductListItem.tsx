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
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiHeart,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiStar
} from "react-icons/fi";
import type { Product } from "@/types/productType";
import { formatVND } from "@/utils/formatVND";

interface Props {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
  onView: (product: Product) => void;
}

export const ProductListItem: React.FC<Props> = ({
  product,
  onEdit,
  onDelete,
  onToggleStatus,
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
    <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Product Image */}
          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiEye className="w-8 h-8 text-gray-300" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 truncate mb-1">
                  {product.title}
                </h3>
                <p className="text-xl font-bold text-gray-900 mb-2">
                  {formatVND(product.price)}
                </p>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                {product.isFeatured && (
                  <Badge className="bg-yellow-400 text-yellow-900 flex items-center gap-1 text-xs">
                    <FiStar className="w-3 h-3" />
                    Nổi bật
                  </Badge>
                )}
                <Badge className={`${statusInfo.color} flex items-center gap-1 text-xs`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusInfo.label}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {product.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FiEye className="w-4 h-4" />
                    <span>{product.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiHeart className="w-4 h-4" />
                    <span>{product.likes}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
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
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <FiCalendar className="w-3 h-3" />
                  <span>{new Date(product.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <FiMoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onView(product)}>
                      <FiEye className="w-4 h-4 mr-2" />
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      <FiEdit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleStatus(product)}>
                      {product.status === "active" ? (
                        <>
                          <FiEyeOff className="w-4 h-4 mr-2" />
                          Ẩn tin
                        </>
                      ) : (
                        <>
                          <FiEye className="w-4 h-4 mr-2" />
                          Hiển thị tin
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(product)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <FiTrash2 className="w-4 h-4 mr-2" />
                      Xóa tin
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};