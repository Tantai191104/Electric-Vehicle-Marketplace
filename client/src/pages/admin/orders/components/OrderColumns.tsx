import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatVND } from "@/utils/formatVND";
import type { Order } from "@/types/orderType";
import { OrderActions } from "./OrderActions";

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

export const getOrderColumns = (
    onView: (order: Order) => void,
    onStatusChange: (orderId: string, newStatus: Order['status'], reason?: string) => void,
    onRefresh?: () => void
): ColumnDef<Order>[] => [
        {
            accessorKey: "orderNumber",
            header: "Mã đơn hàng",
            cell: ({ row }) => (
                <div className="font-medium text-blue-600">
                    {row.getValue("orderNumber")}
                </div>
            ),
        },
        {
            accessorKey: "productId",
            header: "Sản phẩm",
            cell: ({ row }) => {
                const product = row.original.productId;
                return (
                    <div className="max-w-[200px]">
                        <div className="font-medium truncate">{product.title}</div>
                        <div className="text-sm text-gray-500">
                            Số lượng: {row.original.quantity}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "buyerId",
            header: "Người mua",
            cell: ({ row }) => {
                const buyer = row.original.buyerId;
                return (
                    <div>
                        <div className="font-medium">{buyer.name}</div>
                        <div className="text-sm text-gray-500">{buyer.phone}</div>
                    </div>
                );
            },
        },
        {
            accessorKey: "sellerId",
            header: "Người bán",
            cell: ({ row }) => {
                const seller = row.original.sellerId;
                return (
                    <div>
                        <div className="font-medium">{seller.name}</div>
                        <div className="text-sm text-gray-500">{seller.phone}</div>
                    </div>
                );
            },
        },
        {
            accessorKey: "finalAmount",
            header: "Tổng tiền",
            cell: ({ row }) => (
                <div className="text-right">
                    <div className="font-medium text-green-600">
                        {formatVND(row.getValue("finalAmount"))}
                    </div>
                    <div className="text-sm text-gray-500">
                        SP: {formatVND(row.original.totalAmount)}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => {
                const status = row.getValue("status") as Order['status'];
                const statusConfig = {
                    pending: { label: "Chờ xác nhận", variant: "secondary" as const },
                    deposit: { label: "Chờ xác nhận", variant: "secondary" as const },
                    confirmed: { label: "Đã xác nhận", variant: "default" as const },
                    deposit_confirmed: { label: "Đã đặt cọc", variant: "default" as const },
                    shipping: { label: "Đang giao", variant: "outline" as const },
                    shipped: { label: "Đang giao hàng", variant: "outline" as const },
                    delivered: { label: "Đã giao", variant: "default" as const },
                    delivered_fail: { label: "Giao thất bại", variant: "destructive" as const },
                    cancelled: { label: "Đã hủy", variant: "destructive" as const },
                    deposit_cancelled: { label: "Hủy đặt cọc", variant: "destructive" as const },
                    refunded: { label: "Đã hoàn tiền", variant: "secondary" as const },
                    deposit_refunded: { label: "Hoàn tiền đặt cọc", variant: "secondary" as const },
                };
                const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" };
                return (
                    <Badge variant={config.variant}>
                        {config.label}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "payment",
            header: "Thanh toán",
            cell: ({ row }) => {
                const payment = row.original.payment;
                const statusConfig = {
                    pending: { label: "Chờ thanh toán", variant: "secondary" as const },
                    paid: { label: "Đã thanh toán", variant: "default" as const },
                    refunded: { label: "Đã hoàn tiền", variant: "outline" as const },
                    failed: { label: "Thất bại", variant: "destructive" as const },
                };

                const config = statusConfig[payment.status] || statusConfig.pending;

                return (
                    <div>
                        <Badge variant={config.variant}>
                            {config.label}
                        </Badge>
                        <div className="text-sm text-gray-500 mt-1">
                            {payment.method === 'wallet' ? 'Ví điện tử' :
                                payment.method === 'vnpay' ? 'VNPay' :
                                    payment.method === 'zalopay' ? 'ZaloPay' :
                                        payment.method === 'cod' ? 'COD' : 'Chuyển khoản'}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: "Ngày tạo",
            cell: ({ row }) => (
                <div className="text-sm">
                    {formatDate(row.getValue("createdAt"))}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Thao tác",
            cell: ({ row }) => (
                <OrderActions
                    order={row.original}
                    onView={onView}
                            onStatusChange={onStatusChange}
                            onRefresh={onRefresh}
                />
            ),
        },
    ];