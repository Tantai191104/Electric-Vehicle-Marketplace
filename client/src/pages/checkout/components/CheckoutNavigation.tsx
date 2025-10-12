import { FiArrowLeft, FiArrowRight, FiShield } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

interface CheckoutNavigationProps {
    currentStep: number;
    totalSteps: number;
    onPrev: () => void;
    onNext: () => void;
    onFinish: () => void;
    isStepValid: boolean;
    isProcessing?: boolean;
    className?: string;
}

export const CheckoutNavigation: React.FC<CheckoutNavigationProps> = ({
    currentStep,
    totalSteps,
    onPrev,
    onNext,
    onFinish,
    isStepValid,
    isProcessing = false,
    className = ""
}) => (
    <div className={`flex justify-between items-center py-1 ${className}`}>
        {/* Back Button - Minimalist */}
        <Button
            variant="ghost"
            onClick={onPrev}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${currentStep === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            size="sm"
        >
            <FiArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Quay lại</span>
        </Button>

        {/* Security Badge - Compact and Elegant */}
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
            <FiShield className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-semibold text-green-700 hidden sm:inline">
                Bảo mật SSL
            </span>
            <span className="text-xs font-semibold text-green-700 sm:hidden">SSL</span>
        </div>

        {/* Next/Finish Button - Modern Design */}
        {currentStep < totalSteps ? (
            <Button
                onClick={onNext}
                disabled={!isStepValid}
                size="sm"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-sm ${isStepValid
                        ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md transform hover:scale-[1.02]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    }`}
            >
                <span>Tiếp tục</span>
                <FiArrowRight className="w-4 h-4" />
            </Button>
        ) : (
            <Button
                onClick={onFinish}
                disabled={isProcessing || !isStepValid}
                size="sm"
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-sm ${isProcessing || !isStepValid
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-md transform hover:scale-[1.02]'
                    }`}
            >
                {isProcessing ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang xử lý...</span>
                    </>
                ) : (
                    <>
                        <FiShield className="w-4 h-4" />
                        <span>Xác nhận thanh toán</span>
                    </>
                )}
            </Button>
        )}
    </div>
);