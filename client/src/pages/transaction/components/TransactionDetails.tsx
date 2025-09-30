import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FiCreditCard,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiRefreshCw,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiCopy,
  FiExternalLink
} from "react-icons/fi";
import type { Transaction } from "@/types/transactionType";

interface Props {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionDetails: React.FC<Props> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  if (!transaction) return null;

  const getTypeInfo = (type: string) => {
    switch (type) {
      case "deposit":
        return {
          label: "Nạp tiền",
          icon: FiArrowDownLeft,
          color: "text-green-600",
          bgColor: "bg-green-100"
        };
      case "withdrawal":
        return {
          label: "Rút tiền",
          icon: FiArrowUpRight,
          color: "text-red-600",
          bgColor: "bg-red-100"
        };
      case "payment":
        return {
          label: "Thanh toán",
          icon: FiCreditCard,
          color: "text-blue-600",
          bgColor: "bg-blue-100"
        };
      case "refund":
        return {
          label: "Hoàn tiền",
          icon: FiRefreshCw,
          color: "text-purple-600",
          bgColor: "bg-purple-100"
        };
      default:
        return {
          label: type,
          icon: FiCreditCard,
          color: "text-gray-600",
          bgColor: "bg-gray-100"
        };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "completed":
        return {
          label: "Hoàn thành",
          icon: FiCheckCircle,
          color: "bg-green-100 text-green-800 border-green-200"
        };
      case "pending":
        return {
          label: "Đang xử lý",
          icon: FiClock,
          color: "bg-yellow-100 text-yellow-800 border-yellow-200"
        };
      case "failed":
        return {
          label: "Thất bại",
          icon: FiXCircle,
          color: "bg-red-100 text-red-800 border-red-200"
        };
      case "cancelled":
        return {
          label: "Đã hủy",
          icon: FiAlertCircle,
          color: "bg-gray-100 text-gray-800 border-gray-200"
        };
      default:
        return {
          label: status,
          icon: FiAlertCircle,
          color: "bg-gray-100 text-gray-800 border-gray-200"
        };
    }
  };

  const typeInfo = getTypeInfo(transaction.type);
  const statusInfo = getStatusInfo(transaction.status);
  const TypeIcon = typeInfo.icon;
  const StatusIcon = statusInfo.icon;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Có thể thêm toast notification
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${typeInfo.bgColor} flex items-center justify-center`}>
              <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
            </div>
            Chi tiết giao dịch
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Overview */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {transaction.description}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusInfo.label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Số tiền</p>
                  <p className={`text-2xl font-bold ${
                    transaction.type === "deposit" || transaction.type === "refund" 
                      ? "text-green-600" 
                      : "text-red-600"
                  }`}>
                    {transaction.type === "deposit" || transaction.type === "refund" ? "+" : "-"}
                    {new Intl.NumberFormat('vi-VN').format(transaction.amount)} VNĐ
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Loại giao dịch</p>
                  <Badge variant="outline" className="mt-1">
                    {typeInfo.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Thông tin chi tiết</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">ID giao dịch</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-mono text-sm text-gray-900">{transaction._id}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transaction._id)}
                      >
                        <FiCopy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mã tham chiếu</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-mono text-sm text-gray-900">{transaction.reference}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.reference)}
                      >
                        <FiCopy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Số dư trước</p>
                    <p className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('vi-VN').format(transaction.balanceBefore)} VNĐ
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số dư sau</p>
                    <p className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('vi-VN').format(transaction.balanceAfter)} VNĐ
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {transaction.paymentMethod === "wallet" && "Ví điện tử"}
                    {transaction.paymentMethod === "e_wallet" && "ZaloPay/Momo"}
                    {transaction.paymentMethod === "bank_transfer" && "Chuyển khoản ngân hàng"}
                    {transaction.paymentMethod === "credit_card" && "Thẻ tín dụng"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          {(transaction.metadata.bankTransactionId || transaction.metadata.orderId || transaction.metadata.productId) && (
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Thông tin bổ sung</h4>
                <div className="space-y-3">
                  {transaction.metadata.bankTransactionId && (
                    <div>
                      <p className="text-sm text-gray-600">ID giao dịch ngân hàng</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-mono text-sm text-gray-900">
                          {transaction.metadata.bankTransactionId}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(transaction.metadata.bankTransactionId!)}
                        >
                          <FiCopy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {transaction.metadata.orderId && (
                    <div>
                      <p className="text-sm text-gray-600">ID đơn hàng</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-mono text-sm text-gray-900">
                          {transaction.metadata.orderId}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(transaction.metadata.orderId!)}
                        >
                          <FiExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {transaction.metadata.productId && (
                    <div>
                      <p className="text-sm text-gray-600">ID sản phẩm</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-mono text-sm text-gray-900">
                          {transaction.metadata.productId}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(transaction.metadata.productId!)}
                        >
                          <FiExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Thời gian</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tạo giao dịch</p>
                    <p className="text-xs text-gray-600">
                      {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    transaction.status === "completed" ? "bg-green-500" : "bg-gray-300"
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Cập nhật cuối</p>
                    <p className="text-xs text-gray-600">
                      {new Date(transaction.updatedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};