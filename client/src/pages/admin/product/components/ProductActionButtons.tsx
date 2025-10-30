import { Button } from "@/components/ui/button";
import { FiCheck, FiX, FiClock, FiFileText } from "react-icons/fi";
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

  const hasContractPdf = !!product.contractTemplate?.pdfUrl;
  const hasContractHtml = !!product.contractTemplate?.htmlContent;

  if (!isPending && !hasContractPdf && !hasContractHtml) {
    return null;
  }

  return (
    <div className="border-t bg-amber-50 px-4 py-3 flex-shrink-0">
      {isPending && (
        <div className="text-center mb-3">
          <h4 className="font-semibold text-amber-900 text-sm flex items-center justify-center gap-2">
            <FiClock className="w-4 h-4" />
            Sản phẩm đang chờ duyệt
          </h4>
          <p className="text-amber-700 text-xs mt-1">
            Vui lòng phê duyệt hoặc từ chối sản phẩm này
          </p>
        </div>
      )}
      <div className="flex gap-2 max-w-md mx-auto">
        {onApprove && isPending && (
          <Button
            onClick={() => onApprove(product._id)}
            className="bg-green-600 hover:bg-green-700 text-white flex-1 text-sm py-2"
          >
            <FiCheck className="w-4 h-4 mr-1" />
            Phê duyệt
          </Button>
        )}
        {onReject && isPending && (
          <Button
            variant="outline"
            onClick={() => onReject(product._id)}
            className="border-red-300 text-red-700 hover:bg-red-50 flex-1 text-sm py-2"
          >
            <FiX className="w-4 h-4 mr-1" />
            Từ chối
          </Button>
        )}
        {(hasContractPdf || hasContractHtml) && product.contractTemplate && (
          <Button
            variant="outline"
            onClick={() => {
              if (product.contractTemplate!.pdfUrl) {
                window.open(product.contractTemplate!.pdfUrl, "_blank");
              } else if (product.contractTemplate!.htmlContent) {
                let html = product.contractTemplate!.htmlContent;
                // Nhúng hình ảnh chữ ký nếu có
                if (product.contractTemplate!.sellerSignature) {
                  html = html.replace(
                    /<canvas[^>]*id=["']seller-signature-canvas["'][^>]*><\/canvas>/,
                    `<img src="${product.contractTemplate!.sellerSignature}" style="max-width:220px;max-height:80px;border-radius:8px;box-shadow:0 1px 4px #ccc;display:block;margin:8px auto;" />`
                  );
                }
                const win = window.open("", "_blank");
                if (win) {
                  win.document.write(html);
                  win.document.close();
                }
              }
            }}
            className="border-blue-300 text-blue-700 hover:bg-blue-50 flex-1 text-sm py-2"
          >
            <FiFileText className="w-4 h-4 mr-1" />
            Xem hợp đồng
          </Button>
        )}
      </div>
    </div>
  );
};