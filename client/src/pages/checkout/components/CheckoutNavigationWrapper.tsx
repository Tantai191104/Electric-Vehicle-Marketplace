import { Button } from "@/components/ui/button";
import { CheckoutNavigation } from "./CheckoutNavigation";

interface CheckoutNavigationWrapperProps {
    category?: string;
    currentStep: number;
    totalSteps: number;
    isProcessing: boolean;
    buyerSignature?: string;
    contractPdf?: File | null;
    contractId?: string;
    isStepValid: boolean;
    onPrev: () => void;
    onNext: () => void;
    onSaveContract: () => void;
    onSignAndOrder: () => void;
    onFinish: () => void;
}

export function CheckoutNavigationWrapper({
    category,
    currentStep,
    totalSteps,
    isProcessing,
    buyerSignature,
    contractPdf,
    contractId,
    isStepValid,
    onPrev,
    onNext,
    onSaveContract,
    onSignAndOrder,
    onFinish,
}: CheckoutNavigationWrapperProps) {
    // Battery flow - Step 4: Contract signing
    if (category === "battery" && currentStep === 4) {
        return (
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={onPrev}
                    disabled={isProcessing}
                    className="flex-1"
                >
                    Quay lại
                </Button>
                <Button
                    onClick={onSaveContract}
                    disabled={isProcessing || !buyerSignature}
                    className="flex-1"
                >
                    {isProcessing ? "Đang xử lý..." : "Lưu hợp đồng & Tiếp tục"}
                </Button>
            </div>
        );
    }

    // Battery flow - Step 5: Final confirmation
    if (category === "battery" && currentStep === totalSteps) {
        return (
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={onPrev}
                    disabled={isProcessing}
                    className="flex-1"
                >
                    Quay lại
                </Button>
                <Button
                    onClick={onSignAndOrder}
                    disabled={isProcessing || !contractPdf || !contractId}
                    className="flex-1"
                >
                    {isProcessing ? "Đang xử lý..." : "Xác nhận & Ký hợp đồng"}
                </Button>
            </div>
        );
    }

    // Default navigation for other steps
    return (
        <CheckoutNavigation
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrev={onPrev}
            onNext={onNext}
            onFinish={onFinish}
            isStepValid={isStepValid}
            isProcessing={isProcessing}
        />
    );
}
