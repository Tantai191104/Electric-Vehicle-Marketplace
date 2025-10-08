import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiShoppingBag, FiTruck, FiCreditCard, FiCheck, FiArrowLeft, FiUser } from "react-icons/fi";
import { CheckoutNavigation } from "./components/CheckoutNavigation";
import type { CheckoutStep } from "./components/CheckoutHeader";
import { ConfirmationStep } from "./components/ConfirmationStep";
import { ProductInfoStep } from "./components/ProductInfoStep";
import { useAuthStore } from "@/store/auth";
import { useProduct } from "@/hooks/useProduct";
import { PaymentMethodStep, type PaymentMethod } from "./components/PaymentMethodStep";
import { ShippingInfoStep, type ShippingInfo } from "./components/ShippingInfoStep";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LoadingState } from "../detail/components/LoadingState";
import { ErrorState } from "../detail/components/ErrorState";
import type { OrderPayload, ShippingFeePayload } from "@/types/shippingType";
import { orderServices } from "@/services/orderServices";

export default function CheckoutPage() {
    const navigate = useNavigate();
    const params = useParams<{ productId: string; quantity: string }>();
    const productId = params.productId;
    const quantity = parseInt(params.quantity || "1");

    const { user, updateUser } = useAuthStore();
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("system_wallet");
    const [isProcessing, setIsProcessing] = useState(false);
    const [discount] = useState(0);
    const [couponCode] = useState("");

    const { data: productData, isLoading: productLoading, error: productError } = useProduct(productId || "");
    const product = productData?.product;

    const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
        fullName: user?.name || "",
        phone: user?.phone || "",
        email: user?.email || "",
        houseNumber: user?.profile.address.houseNumber || "",
        city: user?.profile.address.province || "",
        district: user?.profile.address.district || "",
        ward: user?.profile.address.ward || "",
        note: ""
    });

    const paymentMethods: PaymentMethod[] = [
        { id: "system_wallet", name: "Ví hệ thống", description: "Thanh toán bằng ví điện tử trong hệ thống", iconUrl: "/src/assets/wallet.svg" },
        { id: "vnpay", name: "VNPay", description: "Thanh toán qua cổng VNPay", iconUrl: "/src/assets/vnpay.svg" },
        { id: "zalopay", name: "ZaloPay", description: "Thanh toán qua ví điện tử ZaloPay", iconUrl: "/src/assets/Zalopay.svg" },
        { id: "cod", name: "Thanh toán khi nhận hàng (COD)", description: "Thanh toán bằng tiền mặt khi giao hàng", iconUrl: "/src/assets/cod.svg", fee: 50000 },
    ];

    const [shippingFee, setShippingFee] = useState<number>(0);

    // Lấy phí vận chuyển
    useEffect(() => {
        async function fetchShippingFee() {
            if (!product || !user || !product.seller?.address) return;
            const payload = {
                service_type_id: 2,
                from_district_id: Number(product.seller.address.districtCode) || 0,
                from_ward_code: product.seller.address.wardCode,
                to_district_id: Number(user?.profile.address.districtCode) || 0,
                to_ward_code: user?.profile.address.wardCode,
                width: product.width || 0,
                length: product.length || 0,
                height: product.height || 0,
                weight: product.weight || 0,
                insurance_value: product.price || 0,
                coupon: null,
            };
            try {
                const result = await orderServices.getShippingFee(payload as ShippingFeePayload);
                setShippingFee(result.data.total);
            } catch (error) {
                console.error("Error fetching shipping fee:", error);
                setShippingFee(0);
            }
        }
        fetchShippingFee();
    }, [product, user]);

    // Kiểm tra productId
    useEffect(() => {
        if (!productId) {
            toast.error("Không tìm thấy sản phẩm");
            navigate('/');
            return;
        }
    }, [productId, navigate]);

    // Loading / Error
    if (productLoading) return <LoadingState message="Đang tải thông tin sản phẩm..." />;
    if (productError || !product) return (
        <ErrorState
            title="Không thể tải sản phẩm"
            message="Sản phẩm bạn muốn mua không tồn tại hoặc đã bị xóa"
            onRetry={() => window.location.reload()}
        />
    );

    // Các bước checkout
    const steps: CheckoutStep[] = [
        { id: 1, title: "Sản phẩm", icon: FiShoppingBag },
        { id: 2, title: "Giao hàng", icon: FiTruck },
        { id: 3, title: "Thanh toán", icon: FiCreditCard },
        { id: 4, title: "Xác nhận", icon: FiCheck }
    ];

    const isStepValid = (step: number): boolean => {
        switch (step) {
            case 1: return true;
            case 2: return !!(
                shippingInfo.fullName?.trim() &&
                shippingInfo.phone?.trim() &&
                shippingInfo.email?.trim() &&
                shippingInfo.houseNumber?.trim() &&
                shippingInfo.city &&
                shippingInfo.district &&
                shippingInfo.ward &&
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email) &&
                /^[0-9\s\-+()]{10,}$/.test(shippingInfo.phone)
            );
            case 3: return selectedPaymentMethod !== '';
            case 4: return true;
            default: return false;
        }
    };

    const isStepClickable = (stepId: number) => {
        if (stepId <= currentStep) return true;
        for (let i = 1; i < stepId; i++) if (!isStepValid(i)) return false;
        return true;
    };

    const handleNext = () => { if (isStepValid(currentStep) && currentStep < 4) setCurrentStep(currentStep + 1); };
    const handlePrev = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };
    const handleStepClick = (stepId: number) => { if (isStepClickable(stepId)) setCurrentStep(stepId); };

    const handlePayment = async () => {
        if (!product) return;
        setIsProcessing(true);
        try {
            const toastId = toast.loading("Đang xử lý thanh toán...");
            const totalAmount = product.price * quantity + (shippingFee ?? 0) - discount;

            if (selectedPaymentMethod === "system_wallet" && typeof user?.wallet.balance === "number") {
                if (user.wallet.balance < totalAmount) {
                    toast.dismiss(toastId);
                    toast.error("Số dư trong ví không đủ để thanh toán đơn hàng này.");
                    setIsProcessing(false);
                    return;
                }
            }

            const orderPayload: OrderPayload = {
                productName: product.title || "",
                from_name: product.seller.name,
                from_phone: product.seller.phone || "",
                from_address: product.seller.address ? 
                    `${product.seller.address.houseNumber}, ${product.seller.address.ward}, ${product.seller.address.district}, ${product.seller.address.province}` : "",
                from_ward_name: product.seller.address?.ward || "",
                from_district_name: product.seller.address?.district || "",
                from_province_name: product.seller.address?.province || "",
                to_name: shippingInfo.fullName,
                to_phone: shippingInfo.phone,
                to_address: `${shippingInfo.houseNumber}, ${shippingInfo.ward}, ${shippingInfo.district}, ${shippingInfo.city}`,
                to_ward_name: shippingInfo.ward,
                to_district_name: shippingInfo.district,
                to_province_name: shippingInfo.city,
                length: product.length || 0,
                width: product.width || 0,
                height: product.height || 0,
                weight: product.weight || 0,
                service_type_id: 2,
                payment_type_id: 2,
                insurance_value: 0,
                cod_amount: totalAmount,
                required_note: "KHONGCHOXEMHANG",
                shipping_fee: shippingFee,
                unit_price: product.price || 0,
                content: `${product.title} x${product.brand}`,
                product_id: product._id,
                seller_id: product.seller._id,
                items: [
                    {
                        name: product.title || "",
                        code: product._id || "",
                        quantity: 1,
                        price: product.price || 0,
                        length: product.length || 0,
                        width: product.width || 0,
                        height: product.height || 0,
                        weight: product.weight || 0,
                        category: { "level1": product.category || "vehicle" }
                    }
                ]
            };

            const result = await orderServices.createOrder(orderPayload);

            if (result.status < 200 || result.status >= 300) {
                toast.dismiss(toastId);
                toast.error("Có lỗi xảy ra trong quá trình tạo đơn hàng. Vui lòng thử lại.");
                setIsProcessing(false);
                return;
            }

            if (selectedPaymentMethod === "system_wallet") {
                updateUser({
                    wallet: { balance: (user?.wallet.balance ?? 0) - totalAmount }
                });
            }

            toast.dismiss(toastId);
            toast.success("Thanh toán thành công! Cảm ơn bạn đã mua hàng.");

            setTimeout(() => navigate("/orders"), 1500);
        } catch (error) {
            toast.error("Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.");
            console.error("Payment error:", error);
        } finally { setIsProcessing(false); }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return <ProductInfoStep product={product} quantity={quantity} />;
            case 2: return <ShippingInfoStep shippingInfo={shippingInfo} onUpdate={setShippingInfo} />;
            case 3: return <PaymentMethodStep selectedMethod={selectedPaymentMethod} onMethodChange={setSelectedPaymentMethod} methods={paymentMethods} />;
            case 4: return <ConfirmationStep product={product} quantity={quantity} shippingInfo={shippingInfo} selectedPaymentMethod={selectedPaymentMethod} paymentMethods={paymentMethods} discount={discount} couponCode={couponCode} shippingFee={shippingFee} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-2 hover:bg-gray-100 -ml-2">
                        <FiArrowLeft className="w-4 h-4" /> Quay lại
                    </Button>
                    <h1 className="text-lg font-semibold text-gray-900">Thanh toán đơn hàng</h1>
                    <div className="w-16" />
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-center py-2">
                    <div className="flex items-center space-x-8">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;
                            const clickable = isStepClickable(step.id);
                            return (
                                <div key={step.id} className="flex items-center">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => clickable && handleStepClick(step.id)} disabled={!clickable} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCompleted ? "bg-green-500 text-white" : isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"} ${clickable ? "hover:opacity-80 cursor-pointer" : "cursor-default"}`}>
                                            <Icon className="w-4 h-4" />
                                        </button>
                                        <span className={`text-sm font-medium hidden sm:block ${isActive || isCompleted ? "text-gray-900" : "text-gray-500"}`}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && <div className={`w-8 sm:w-12 h-px mx-4 ${currentStep > step.id ? "bg-green-500" : "bg-gray-200"}`} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="py-6 max-w-5xl mx-auto px-4">
                <div className="max-w-3xl mx-auto bg-white rounded-xl border shadow-sm">
                    <div className="px-6 py-4 border-b bg-gray-50/50 rounded-t-xl flex items-center gap-3">
                        {currentStep === 1 && <FiShoppingBag className="w-5 h-5 text-blue-600" />}
                        {currentStep === 2 && <FiUser className="w-5 h-5 text-blue-600" />}
                        {currentStep === 3 && <FiCreditCard className="w-5 h-5 text-blue-600" />}
                        {currentStep === 4 && <FiCheck className="w-5 h-5 text-green-600" />}
                        <h2 className="text-lg font-semibold text-gray-900">{steps.find(s => s.id === currentStep)?.title}</h2>
                        <span className="ml-auto text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">{currentStep}/4</span>
                    </div>

                    <div className="p-6">{renderStepContent()}</div>

                    <div className="px-6 py-4 border-t bg-gray-50/30 rounded-b-xl">
                        <CheckoutNavigation currentStep={currentStep} totalSteps={4} onPrev={handlePrev} onNext={handleNext} onFinish={handlePayment} isStepValid={isStepValid(currentStep)} isProcessing={isProcessing} />
                    </div>
                </div>
            </div>
        </div>
    );
}
