import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FiPackage, FiCheck, FiX, FiClock, FiStar, FiInfo } from "react-icons/fi";
import type { Product } from "@/types/productType";

interface Props {
  product: Product;
}

export const ProductHeader: React.FC<Props> = ({ product }) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return {
          label: "Đã duyệt",
          color: "bg-emerald-100 text-emerald-800",
          icon: <FiCheck className="w-3 h-3" />
        };
      case "inactive":
        return {
          label: "Tạm dừng",
          color: "bg-red-100 text-red-800",
          icon: <FiX className="w-3 h-3" />
        };
      case "pending":
        return {
          label: "Chờ duyệt",
          color: "bg-amber-100 text-amber-800",
          icon: <FiClock className="w-3 h-3" />
        };
      case "sold":
        return {
          label: "Đã bán",
          color: "bg-slate-100 text-slate-800",
          icon: <FiCheck className="w-3 h-3" />
        };
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800",
          icon: <FiInfo className="w-3 h-3" />
        };
    }
  };

  const statusInfo = getStatusInfo(product.status);

  return (
    <DialogHeader className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiPackage className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-lg font-bold text-gray-900 truncate">
              {product.title}
            </DialogTitle>
            <p className="text-xs text-gray-600">
              {new Date(product.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge className={`${statusInfo.color} px-2 py-1 text-xs flex items-center gap-1`}>
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>
          {product.isFeatured && (
            <Badge className="bg-yellow-400 text-yellow-900 px-2 py-1 text-xs flex items-center gap-1">
              <FiStar className="w-3 h-3" />
              Nổi bật
            </Badge>
          )}
        </div>
      </div>
    </DialogHeader>
  );
};