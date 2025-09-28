import { formatVND } from '@/utils/formatVND';
import React from 'react';
import { FiCheck } from 'react-icons/fi';

export interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    iconUrl: string; // thay vì ReactNode
    fee?: number;
}

interface PaymentMethodStepProps {
    selectedMethod: string;
    onMethodChange: (methodId: string) => void;
    methods?: PaymentMethod[];
    className?: string;
}

export const PaymentMethodStep: React.FC<PaymentMethodStepProps> = ({
    selectedMethod,
    onMethodChange,
    methods,
    className = ""
}) => {
    return (
        <div className={`space-y-6 ${className}`}>
            <div className="space-y-3">
                {methods?.map((method) => {
                    const isAvailable = method.id === "system_wallet";
                    const isSelected = selectedMethod === method.id;
                    return (
                        <div
                            key={method.id}
                            onClick={() => isAvailable && onMethodChange(method.id)}
                            className={`border-2 rounded-xl p-4 transition-all duration-200 ${isSelected
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                                } ${isAvailable ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Radio circle */}
                                <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                                        ? "border-blue-500 bg-blue-500"
                                        : "border-gray-300"
                                        }`}
                                >
                                    {isSelected && (
                                        <FiCheck className="w-3 h-3 text-white" />
                                    )}
                                </div>

                                {/* SVG Image */}
                                <img
                                    src={method.iconUrl}
                                    alt={method.name}
                                    className="w-12 h-12 object-contain"
                                />

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900">{method.name}</p>
                                        {method.fee && (
                                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                                                +{formatVND(method.fee)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{method.description}</p>
                                    {!isAvailable && (
                                        <p className="text-xs text-red-500 mt-1">
                                            Hiện tại chưa khả dụng
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
