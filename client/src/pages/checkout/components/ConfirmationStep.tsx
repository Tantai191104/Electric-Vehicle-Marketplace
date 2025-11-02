import type { Product } from "@/types/productType";
import type { ShippingInfo } from "./ShippingInfoStep";
import { calculateOrderSummary, formatVND } from "@/utils/formatVND";
import type { PaymentMethod } from "./PaymentMethodStep";

interface ConfirmationStepProps {
    product: Product;
    quantity: number;
    shippingInfo: ShippingInfo;
    selectedPaymentMethod: string;
    paymentMethods: PaymentMethod[];
    discount?: number;
    couponCode?: string;
    className?: string;
    shippingFee?: number;
    depositAmount?: number;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
    product,
    quantity,
    shippingInfo,
    selectedPaymentMethod,
    paymentMethods,
    discount = 0,
    couponCode = '',
    className = "",
    shippingFee,
    depositAmount = 500000
}) => {

    const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
    let subtotal = 0, shipping = 0, total = 0, deposit = 0;
    const isVehicle = product.category === "vehicle";
    if (isVehicle) {
        subtotal = 0;
        shipping = 0;
        deposit = depositAmount;
        total = depositAmount;
    } else {
        const summary = calculateOrderSummary(
            product.price,
            quantity,
            selectedMethod?.fee || 0,
            discount,
            shippingFee ?? 0
        );
        subtotal = summary.subtotal;
        shipping = summary.shipping;
        total = summary.total;
    }
    const SummaryCard = ({
        title,
        children,
        className: cardClassName = ""
    }: {
        title?: string;
        children: React.ReactNode;
        className?: string;
    }) => (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${cardClassName}`}>
            <h3 className="text-base font-semibold text-gray-900 mb-3">{title}</h3>
            {children}
        </div>
    );
    console.log(shippingInfo)
    return (
        <div className={`space-y-6 ${className}`}>
            {/* Product Order Summary */}
            <SummaryCard title="Thông tin đơn hàng">
                <div className="flex gap-3">
                    <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                        <img
                            src={product.images?.[0] || '/placeholder-car.jpg'}
                            alt={product.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{product.title}</h4>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                                {product.brand}
                            </span>
                            <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">
                                {product.model}
                            </span>
                            <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-xs font-medium">
                                {product.year}
                            </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <div className="bg-orange-50 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold">
                                SL: {quantity}
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-blue-600">{formatVND(product.price)}</div>
                                <div className="text-xs text-gray-500">Đơn giá</div>
                            </div>
                        </div>
                    </div>
                </div>
            </SummaryCard>

            {/* Info Summary: giao hàng hoặc lịch hẹn */}
            <SummaryCard title={isVehicle ? "Thông tin đặt cọc" : "Thông tin giao hàng"}>
                <div className="space-y-2">
                    {isVehicle ? (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">Thông tin sẽ được cập nhật sau</h4>
                                    <p className="text-sm text-gray-600">
                                        Sau khi hoàn tất thanh toán đặt cọc, đội ngũ chăm sóc khách hàng sẽ liên hệ với bạn trong vòng 24 giờ để xác nhận địa điểm và thời gian nhận xe.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="bg-gray-50 rounded-md p-2.5">
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Người nhận</div>
                                    <div className="font-semibold text-gray-900">{shippingInfo.fullName}</div>
                                </div>
                                <div className="bg-gray-50 rounded-md p-2.5">
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Điện thoại</div>
                                    <div className="font-semibold text-blue-600">{shippingInfo.phone}</div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-md p-2.5">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</div>
                                <div className="font-medium text-gray-700">{shippingInfo.email}</div>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-md p-2.5">
                                <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Địa chỉ giao hàng</div>
                                <div className="font-semibold text-gray-900">
                                    {shippingInfo.houseNumber}, {shippingInfo.ward}, {shippingInfo.district}, {shippingInfo.city}
                                </div>
                            </div>
                            {shippingInfo.note && (
                                <div className="bg-yellow-50 border border-yellow-100 rounded-md p-2.5">
                                    <div className="text-xs font-medium text-yellow-600 uppercase tracking-wide mb-1">Ghi chú</div>
                                    <div className="font-medium text-gray-700">{shippingInfo.note}</div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </SummaryCard>

            {/* Order Summary */}
            <SummaryCard title={isVehicle ? "Thanh toán đặt cọc" : "Chi tiết thanh toán"}>
                <div className="space-y-2">
                    {/* Payment Method */}
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-2.5 mb-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-800">Phương thức thanh toán</span>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-blue-800">{selectedMethod?.name}</span>
                                {selectedMethod?.fee && (
                                    <span className="text-xs text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded">
                                        +{formatVND(selectedMethod.fee)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Subtotal, Shipping, Tax, Discount for non-vehicle */}
                    {!isVehicle && (
                        <>
                            <div className="flex justify-between items-center bg-gray-50 px-2.5 py-2 rounded-md">
                                <span className="text-gray-700 font-medium text-sm">
                                    Tạm tính
                                    <span className="text-xs text-gray-500 ml-1">
                                        ({quantity} x {formatVND(product.price)})
                                    </span>
                                </span>
                                <span className="font-semibold text-gray-900">{formatVND(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 px-2.5 py-2 rounded-md">
                                <span className="text-gray-700 font-medium text-sm">Phí vận chuyển</span>
                                <span className={`font-semibold ${shipping === 0 ? "text-green-600" : "text-gray-900"}`}>
                                    {shipping === 0 ? (
                                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                                            Miễn phí
                                        </span>
                                    ) : (
                                        formatVND(shipping)
                                    )}
                                </span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between items-center bg-green-50 px-2.5 py-2 rounded-md border border-green-100">
                                    <span className="text-green-800 font-medium text-sm">
                                        Giảm giá
                                        <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded ml-1">
                                            {couponCode}
                                        </span>
                                    </span>
                                    <span className="font-semibold text-green-700">-{formatVND(discount)}</span>
                                </div>
                            )}
                        </>
                    )}

                    {/* Only show deposit for vehicle */}
                    {isVehicle && (
                        <>
                            <div className="flex justify-between items-center bg-yellow-50 border border-yellow-100 px-2.5 py-2 rounded-md">
                                <span className="text-yellow-800 font-medium text-sm">Phí đặt cọc xe</span>
                                <span className="font-semibold text-yellow-800">{formatVND(deposit)}</span>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mt-2">
                                <p className="text-xs text-blue-700">
                                    <strong>Lưu ý:</strong> Số tiền còn lại sẽ được thanh toán khi nhận xe. Chúng tôi sẽ liên hệ với bạn để xác nhận chi tiết.
                                </p>
                            </div>
                        </>
                    )}

                    {/* Total */}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex justify-between items-center bg-blue-600 text-white px-3 py-2.5 rounded-lg">
                            <span className="font-semibold">Tổng thanh toán</span>
                            <span className="text-xl font-bold">{formatVND(total)}</span>
                        </div>
                    </div>
                </div>
            </SummaryCard>
        </div>
    );
};