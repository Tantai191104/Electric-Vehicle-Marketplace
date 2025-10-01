import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
export interface CheckoutStep {
    id: number;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface CheckoutHeaderProps {
    title?: string;
    steps: CheckoutStep[];
    currentStep: number;
    onGoBack: () => void;
    onStepClick?: (stepId: number) => void;
    isStepClickable?: (stepId: number) => boolean;
    className?: string;
}

export const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({
    title = "Thanh toán",
    steps,
    currentStep,
    onGoBack,
    onStepClick,
    isStepClickable,
    className = ""
}) => (
    <div className={`bg-white shadow-sm border-b sticky top-0 z-40 ${className}`}>
        <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onGoBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <FiArrowLeft className="w-5 h-5" />
                    Quay lại
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>

            {/* Steps Navigation */}
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    const clickable = isStepClickable?.(step.id) ?? false;

                    return (
                        <React.Fragment key={step.id}>
                            <button
                                onClick={() => clickable && onStepClick?.(step.id)}
                                disabled={!clickable}
                                className={`flex flex-col items-center gap-2 transition-colors ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                    } ${clickable ? 'hover:text-blue-500 cursor-pointer' : 'cursor-default'}`}
                            >
                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${isCompleted
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : isActive
                                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                                        : 'border-gray-300'
                                    }`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">{step.title}</span>
                            </button>

                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-px mx-4 transition-colors ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                                    }`}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    </div>
);