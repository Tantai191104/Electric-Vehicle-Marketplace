import { Button } from "@/components/ui/button";
import { FiCheck, FiX, FiClock } from "react-icons/fi";
import type { Product } from "@/types/productType";

interface Props {
  product: Product;
  onApprove?: (productId: string) => void;
  onReject?: (productId: string) => void;
}

export const ProductActionButtons: React.FC<Props> = ({
  product,
  onApprove,
  onReject,
}) => {
  const isPending = product.status === "pending";

  if (!isPending || (!onApprove && !onReject)) {
    return null;
  }

  return (
    <div className="border-t bg-amber-50 px-4 py-3 flex-shrink-0">
      <div className="text-center mb-3">
        <h4 className="font-semibold text-amber-900 text-sm flex items-center justify-center gap-2">
          <FiClock className="w-4 h-4" />
          Sản phẩm đang chờ duyệt
        </h4>
        <p className="text-amber-700 text-xs mt-1">
          Vui lòng phê duyệt hoặc từ chối sản phẩm này
        </p>
      </div>

      <div className="flex gap-2 max-w-md mx-auto">
        {onApprove && (
          <Button
            onClick={() => onApprove(product._id)}
            className="bg-green-600 hover:bg-green-700 text-white flex-1 text-sm py-2"
          >
            <FiCheck className="w-4 h-4 mr-1" />
            Phê duyệt
          </Button>
        )}
        {onReject && (
          <Button
            variant="outline"
            onClick={() => onReject(product._id)}
            className="border-red-300 text-red-700 hover:bg-red-50 flex-1 text-sm py-2"
          >
            <FiX className="w-4 h-4 mr-1" />
            Từ chối
          </Button>
        )}
      </div>
    </div>
  );
};