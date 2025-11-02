import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FiArrowUpRight,
  FiArrowDownLeft,
  FiCreditCard,
  FiRefreshCw,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from "react-icons/fi";
import type { Transaction } from "@/types/transactionType";

interface Props {
  transactions: Transaction[];
  loading: boolean;
  onSelectTransaction: (transaction: Transaction) => void;
}

export const TransactionsList: React.FC<Props> = ({
  transactions,
  loading,
  onSelectTransaction
}) => {
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

  // payment method label removed from UI per updated UX

  if (loading) {
    return (
      <Card className="border border-gray-200 shadow-lg bg-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <FiRefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 shadow-lg bg-white">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-lg text-gray-900">
          Danh sách giao dịch ({transactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiCreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Không có giao dịch nào được tìm thấy</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((transaction) => {
              const typeInfo = getTypeInfo(transaction.type);
              const statusInfo = getStatusInfo(transaction.status);
              const TypeIcon = typeInfo.icon;
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={transaction._id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onSelectTransaction(transaction)}
                >
                  <div className="flex items-center gap-4">
                    {/* Type Icon */}
                    <div className={`w-12 h-12 rounded-lg ${typeInfo.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <TypeIcon className={`w-6 h-6 ${typeInfo.color}`} />
                    </div>

                    {/* Transaction Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            ID: {transaction._id.slice(-8)}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {typeInfo.label}
                            </Badge>
                            <Badge className={`text-xs ${statusInfo.color}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>

                            {/* Extra badge for purchase/payment transactions */}
                            {transaction.type === "payment" && (
                              <Badge className="text-xs bg-indigo-100 text-indigo-800 border-indigo-200">
                                Mua hàng
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0 ml-4">
                          <p className={`font-bold text-lg ${transaction.type === "deposit" || transaction.type === "refund"
                            ? "text-green-600"
                            : "text-red-600"
                            }`}>
                            {transaction.type === "deposit" || transaction.type === "refund" ? "+" : "-"}
                            {new Intl.NumberFormat('vi-VN').format(transaction.amount)} VNĐ
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      {/* Balance Change */}
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <span>Số dư:</span>
                        <span>{new Intl.NumberFormat('vi-VN').format(transaction.balanceBefore)} VNĐ</span>
                        <FiArrowUpRight className="w-3 h-3" />
                        <span className="font-semibold text-gray-700">
                          {new Intl.NumberFormat('vi-VN').format(transaction.balanceAfter)} VNĐ
                        </span>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTransaction(transaction);
                      }}
                    >
                      <FiEye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};