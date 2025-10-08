import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FiAlertTriangle, FiPackage, FiTruck } from "react-icons/fi";
import type { Order } from "@/types/orderType";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  order: Order | null;
  isLoading: boolean;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  order,
  isLoading
}) => {
  if (!order) return null;

  const isGHNOrder = !!order.shipping?.trackingNumber;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <FiAlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Xác nhận hủy đơn hàng
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Hành động này không thể hoàn tác
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <FiPackage className="h-4 w-4" />
                Thông tin đơn hàng
              </h4>
              {isGHNOrder && (
                <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">
                  <FiTruck className="h-3 w-3 mr-1" />
                  GHN
                </Badge>
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-medium text-gray-900">#{order.orderNumber}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Sản phẩm:</span>
                <span className="font-medium text-gray-900 text-right max-w-60 truncate">
                  {order.productId.title}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="font-bold text-gray-900">
                  {new Intl.NumberFormat('vi-VN').format(order.finalAmount)} VNĐ
                </span>
              </div>

              {isGHNOrder && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã vận đơn:</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {order.shipping.trackingNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-800 mb-1">
                  {isGHNOrder ? "Lưu ý về đơn hàng GHN:" : "Lưu ý:"}
                </p>
                <ul className="text-red-700 space-y-1">
                  {isGHNOrder ? (
                    <>
                      <li>• Đơn hàng sẽ được hủy ngay lập tức trên hệ thống GHN</li>
                      <li>• Không thể hoàn tác sau khi xác nhận</li>
                      <li>• Tiền sẽ được hoàn lại trong 3-5 ngày làm việc</li>
                    </>
                  ) : (
                    <>
                      <li>• Đơn hàng sẽ được chuyển về trạng thái "Đã hủy"</li>
                      <li>• Không thể hoàn tác sau khi xác nhận</li>
                      <li>• Tiền sẽ được hoàn lại theo chính sách của shop</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Không hủy
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                Đang hủy...
              </>
            ) : (
              `Xác nhận hủy ${isGHNOrder ? 'đơn GHN' : 'đơn hàng'}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};