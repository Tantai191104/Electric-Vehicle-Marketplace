import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info, RefreshCw } from "lucide-react";
import { formatVND } from "@/utils/formatVND";
import type { Order } from "@/types/orderType";
import { useState, useEffect, useRef, useCallback } from "react";
import { adminServices } from "@/services/adminServices";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface OrderDetailDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  onOrderUpdated?: (updatedOrder: Order) => void;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export function OrderDetailDialog({
  order,
  isOpen,
  onClose,
  onRefresh,
  onOrderUpdated,
}: OrderDetailDialogProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();
  const lastSyncTime = useRef<number>(0);
  const autoSyncInterval = useRef<NodeJS.Timeout | null>(null);
  const hasAutoSynced = useRef(false);

  // All hooks must be called before any early returns
  const handleSyncGhn = useCallback(async (silent = false) => {
    if (!order?.shipping?.trackingNumber || order?.shipping?.carrier !== 'GHN') {
      if (!silent) {
        toast.error("Đơn hàng này không sử dụng GHN hoặc chưa có tracking number");
      }
      return;
    }

    setIsSyncing(true);
    try {
      const result = await adminServices.syncGhnOrderStatus(order._id);
      lastSyncTime.current = Date.now();
      
      
      if (result.success && result.data?.updated) {
        if (!silent) {
          toast.success(`✅ Đã cập nhật: ${result.data.oldStatus} → ${result.data.newStatus}`, {
            description: `GHN status: ${result.data.ghnStatus}`,
          });
        }
        
        // Refresh order data - force refetch to update list immediately
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        await queryClient.refetchQueries({ queryKey: ["orders"] }); // Force refetch
        if (onRefresh) onRefresh();
        
        // Update order in dialog if new status available
        if (result.data?.newStatus && order && onOrderUpdated) {
          onOrderUpdated({ ...order, status: result.data.newStatus as Order['status'] });
        }
      } else {
        // Only show info toast if not silent and status hasn't changed
        if (!silent) {
          if (result.data?.ghnStatus && result.data?.mappedStatus) {
            if (result.data.mappedStatus === result.data.oldStatus) {
              toast.info("Trạng thái đã đúng", {
                description: `GHN: ${result.data.ghnStatus} → ${result.data.mappedStatus}`,
              });
            } else {
              toast.warning("Không thể cập nhật trạng thái", {
                description: `GHN: ${result.data.ghnStatus} → ${result.data.mappedStatus || 'null'}`,
              });
            }
          }
        }
        
        // Still refresh to show current status - force refetch
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        await queryClient.refetchQueries({ queryKey: ["orders"] }); // Force refetch
        if (onRefresh) onRefresh();
        
        // Update order in dialog even if not updated (might have changed on server)
        if (result.data?.newStatus && order && onOrderUpdated) {
          onOrderUpdated({ ...order, status: result.data.newStatus as Order['status'] });
        } else if (result.data?.currentStatus && order && onOrderUpdated) {
          onOrderUpdated({ ...order, status: result.data.currentStatus as Order['status'] });
        }
      }
    } catch (error: any) {
      console.error("[OrderDetailDialog] Sync GHN error:", error?.response?.data?.message || error.message);
      
      // Extract detailed error message
      const errorData = error?.response?.data;
      const errorMessage = errorData?.message || errorData?.error || error.message || "Vui lòng thử lại sau";
      const errorDetails = errorData?.details;
      
      // Show more specific error
      let description = errorMessage;
      
      // Add status code info
      if (error?.response?.status) {
        description = `[${error.response.status}] ${description}`;
      }
      
      // Add tracking number if available
      if (errorDetails?.trackingNumber) {
        description = `${description}\nTracking: ${errorDetails.trackingNumber}`;
      } else if (order?.shipping?.trackingNumber) {
        description = `${description}\nTracking: ${order.shipping.trackingNumber}`;
      }
      
      // Add GHN response message
      if (errorDetails?.ghnResponse?.message) {
        description = `${description}\nGHN: ${errorDetails.ghnResponse.message}`;
      } else if (errorDetails?.ghnResponse) {
        description = `${description}\nGHN Response: ${JSON.stringify(errorDetails.ghnResponse)}`;
      }
      
      // Add error code if available
      if (errorDetails?.code) {
        description = `${description}\nCode: ${errorDetails.code}`;
      }
      
      toast.error("❌ Không thể đồng bộ với GHN", {
        description: description,
        duration: 7000, // Longer duration for detailed errors
      });
    } finally {
      setIsSyncing(false);
    }
  }, [order, queryClient, onRefresh]);

  // Auto-sync when dialog opens (if GHN order)
  useEffect(() => {
    if (isOpen && order && order.shipping?.carrier === 'GHN' && order.shipping?.trackingNumber) {
      // Only auto-sync if haven't synced recently (within last 30 seconds)
      const now = Date.now();
      const timeSinceLastSync = now - lastSyncTime.current;
      
      if (!hasAutoSynced.current && timeSinceLastSync > 30000) {
        hasAutoSynced.current = true;
        handleSyncGhn(true); // true = silent sync (no toast on success)
      }
    } else {
      hasAutoSynced.current = false;
    }

    return () => {
      hasAutoSynced.current = false;
    };
  }, [isOpen, order, handleSyncGhn]);

  // Auto-refresh interval when dialog is open (every 60 seconds)
  useEffect(() => {
    if (isOpen && order && order.shipping?.carrier === 'GHN') {
      autoSyncInterval.current = setInterval(() => {
        if (order.shipping?.carrier === 'GHN' && order.shipping?.trackingNumber) {
          handleSyncGhn(true); // Silent sync
        }
      }, 60000); // 60 seconds
    }

    return () => {
      if (autoSyncInterval.current) {
        clearInterval(autoSyncInterval.current);
        autoSyncInterval.current = null;
      }
    };
  }, [isOpen, order, handleSyncGhn]);

  // Early return after all hooks
  if (!order) return null;

  const getStatusBadge = (status: Order['status']) => {
    type BadgeConfig = { label: string; variant: 'secondary' | 'default' | 'outline' | 'destructive' };
    const statusConfig: Record<string, BadgeConfig> = {
      pending: { label: "Chờ xác nhận", variant: "secondary" },
      confirmed: { label: "Đã xác nhận", variant: "default" },
      shipping: { label: "Đang giao", variant: "outline" },
      shipped: { label: "Đang giao hàng", variant: "outline" },
      delivered: { label: "Đã giao", variant: "default" },
      cancelled: { label: "Đã hủy", variant: "destructive" },
      refunded: { label: "Đã hoàn tiền", variant: "secondary" },
      delivered_fail: { label: "Giao thất bại", variant: "destructive" },
      deposit_pending: { label: "Đang đặt cọc", variant: "secondary" },
      deposit_confirmed: { label: "Đã đặt cọc", variant: "default" },
      deposit_cancelled: { label: "Đã hủy đặt cọc", variant: "destructive" },
      deposit_refunded: { label: "Hoàn tiền đặt cọc", variant: "secondary" },
    };

    const config = statusConfig[status] ?? statusConfig['pending']!;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (paymentStatus: Order['payment']['status']) => {
    const statusConfig = {
      pending: { label: "Chờ thanh toán", variant: "secondary" as const },
      paid: { label: "Đã thanh toán", variant: "default" as const },
      refunded: { label: "Đã hoàn tiền", variant: "outline" as const },
      failed: { label: "Thất bại", variant: "destructive" as const },
    };

    const config = statusConfig[paymentStatus] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Chi tiết đơn hàng {order.orderNumber}
          </DialogTitle>
          {/* GHN Notice */}
          {
            order.shipping?.method === 'GHN' && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <div className="text-sm text-blue-800 flex-1">
                      <span className="font-medium">Đơn hàng Giao Hàng Nhanh (GHN)</span>
                      <p className="text-xs text-blue-600 mt-1">
                        Đơn hàng được quản lý bởi GHN. Bấm nút đồng bộ để cập nhật trạng thái mới nhất từ GHN.
                      </p>
                      {order.shipping?.trackingNumber && (
                        <p className="text-xs text-blue-700 mt-1 font-mono">
                          Tracking: {order.shipping.trackingNumber}
                        </p>
                      )}
                    </div>
                  </div>
                    <Button
                      onClick={() => handleSyncGhn(false)}
                      disabled={isSyncing}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                      {isSyncing ? "Đang đồng bộ..." : "Đồng bộ GHN"}
                    </Button>
                    <span className="text-xs text-blue-600">🔄 Tự động mỗi 60s</span>
                </div>
              </div>
            )
          }
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Order Info */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Thông tin đơn hàng</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thanh toán:</span>
                  {getPaymentStatusBadge(order.payment.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức:</span>
                  <span className="font-medium">
                    {order.payment.method === 'wallet' ? 'Ví điện tử' :
                      order.payment.method === 'vnpay' ? 'VNPay' :
                        order.payment.method === 'zalopay' ? 'ZaloPay' :
                          order.payment.method === 'cod' ? 'COD' : 'Chuyển khoản'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo:</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
                {order.shipping.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking:</span>
                    <span className="font-medium">{order.shipping.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Thông tin sản phẩm</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Tên sản phẩm:</span>
                  <p className="font-medium mt-1">{order.productId.title}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số lượng:</span>
                  <span className="font-medium">{order.quantity}</span>
                </div>
                {order.shipping.method == 'GHN' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đơn giá:</span>
                      <span className="font-medium">{formatVND(order.unitPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phí ship:</span>
                      <span className="font-medium">{formatVND(order.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Tổng tiền:</span>
                      <span className="font-bold text-green-600">{formatVND(order.finalAmount)}</span>
                    </div>
                  </>
                )}
                {order.shipping.method != 'GHN' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tiền cọc:</span>
                      <p className="font-bold">{formatVND(order.finalAmount)}</p>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Tổng tiền:</span>
                      <span className="font-bold text-green-600">{formatVND(order.finalAmount)}</span>
                    </div>
                  </>
                )}

              </div>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="space-y-4">
            {/* Buyer Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Thông tin người mua</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Họ tên:</span>
                  <p className="font-medium">{order.buyerId.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{order.buyerId.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Số điện thoại:</span>
                  <p className="font-medium">{order.buyerId.phone}</p>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Thông tin người bán</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Họ tên:</span>
                  <p className="font-medium">{order.sellerId.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{order.sellerId.email}</p>
                </div>
              </div>
            </div>

            {/* Shipping or Meeting Info */}
            {order.shipping.method === 'GHN' ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Địa chỉ giao hàng</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Người nhận:</span>
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Số điện thoại:</span>
                    <p className="font-medium">{order.shippingAddress.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Địa chỉ:</span>
                    <p className="font-medium">
                      {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.province}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Thông tin gặp mặt</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Địa điểm gặp mặt:</span>
                    <p className="font-medium">{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.province}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Thời gian gặp mặt:</span>
                    <p className="font-medium">{order.shipping.estimatedDelivery ? formatDate(order.shipping.estimatedDelivery) : '…'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Lịch sử đơn hàng</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Đơn hàng được tạo</p>
                    <p className="text-gray-600 text-xs">{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                {order.timeline.map((event) => (
                  <div key={event._id} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.description}</p>
                      <p className="text-gray-600 text-xs">{formatDate(event.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog >
  );
}