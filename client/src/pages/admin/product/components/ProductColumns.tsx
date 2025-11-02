import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ProductActions } from "./ProductActions";
import type { Product } from "@/types/productType";
import { formatVND } from "@/utils/formatVND";

export const getProductColumns = (
  onViewProduct: (product: Product) => void,
  onToggleFeatured: (productId: string, featured: boolean) => void
): ColumnDef<Product>[] => [
    {
      accessorKey: "images",
      header: "Hình ảnh",
      cell: ({ row }) => (
        <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
          {row.original.images?.[0] ? (
            <img
              src={row.original.images[0]}
              alt={row.original.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No image
            </div>
          )}
        </div>
      ),
      size: 80,
    },
    {
      accessorKey: "title",
      header: "Tên sản phẩm",
      cell: (info) => (
        <div className="max-w-[200px]">
          <div className="font-semibold text-gray-800 truncate">
            {String(info.getValue())}
          </div>
          <div className="text-sm text-gray-500">
            {info.row.original.brand} {info.row.original.model}
          </div>
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: "category",
      header: "Danh mục",
      cell: ({ row }) => {
        const category = row.original.category;
        const getCategoryInfo = (cat: string) => {
          switch (cat) {
            case "vehicle":
              return { label: "Xe điện", color: "bg-blue-100 text-blue-800" };
            case "battery":
              return { label: "Pin xe điện", color: "bg-green-100 text-green-800" };
            default:
              return { label: "Khác", color: "bg-gray-100 text-gray-800" };
          }
        };
        const categoryInfo = getCategoryInfo(category);
        return (
          <Badge variant="outline" className={`${categoryInfo.color} border-0 px-2 py-1 text-xs rounded-full font-medium`}>
            {categoryInfo.label}
          </Badge>
        );
      },
      size: 120,
    },
    {
      accessorKey: "condition",
      header: "Tình trạng",
      cell: ({ row }) => {
        const condition = row.original.condition;
        const getConditionInfo = (cond: string) => {
          switch (cond) {
            case "new":
              return { label: "Mới", color: "bg-green-100 text-green-800" };
            case "used":
              return { label: "Đã sử dụng", color: "bg-yellow-100 text-yellow-800" };
            case "refurbished":
              return { label: "Tân trang", color: "bg-blue-100 text-blue-800" };
            default:
              return { label: condition, color: "bg-gray-100 text-gray-800" };
          }
        };
        const conditionInfo = getConditionInfo(condition);
        return (
          <Badge variant="outline" className={`${conditionInfo.color} border-0 px-2 py-1 text-xs rounded-full font-medium`}>
            {conditionInfo.label}
          </Badge>
        );
      },
      size: 100,
    },
    {
      accessorKey: "price",
      header: "Giá",
      cell: (info) => (
        <div className="font-semibold text-gray-900">
          {formatVND(Number(info.getValue()))}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "year",
      header: "Năm SX",
      cell: (info) => (
        <div className="text-sm text-gray-600">
          {String(info.getValue())}
        </div>
      ),
      size: 80,
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.original.status;
        const getStatusInfo = (status: string) => {
          switch (status) {
            case "active":
              return { label: "Hoạt động", color: "bg-green-100 text-green-800" };
            case "inactive":
              return { label: "Ngừng hoạt động", color: "bg-gray-100 text-gray-800" };
            case "pending":
              return { label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-800" };
            case "rejected":
              return { label: "Bị từ chối", color: "bg-red-100 text-red-800" };
            case "sold":
              return { label: "Đã bán", color: "bg-blue-100 text-blue-800" };
            default:
              return { label: status, color: "bg-gray-100 text-gray-800" };
          }
        };
        const statusInfo = getStatusInfo(status);
        return (
          <Badge variant="outline" className={`${statusInfo.color} border-0 px-2 py-1 text-xs rounded-full font-medium`}>
            {statusInfo.label}
          </Badge>
        );
      },
      size: 100,
    },
    {
      accessorKey: "isFeatured",
      header: "Nổi bật",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.original.isFeatured ? (
            <Badge className="bg-yellow-100 text-yellow-800 border-0 px-2 py-1 text-xs rounded-full">
              ⭐ Nổi bật
            </Badge>
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )}
        </div>
      ),
      size: 80,
    },
    {
      accessorKey: "views",
      header: "Lượt xem",
      cell: (info) => (
        <div className="text-center text-sm font-medium text-gray-700">
          {Number(info.getValue()).toLocaleString()}
        </div>
      ),
      size: 80,
    },
    {
      accessorKey: "likes",
      header: "Lượt thích",
      cell: (info) => (
        <div className="text-center text-sm font-medium text-gray-700">
          {Number(info.getValue()).toLocaleString()}
        </div>
      ),
      size: 80,
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => (
        <ProductActions
          product={row.original}
          onView={onViewProduct}
          onToggleFeatured={onToggleFeatured}
        />
      ),
      size: 120,
    },
  ];