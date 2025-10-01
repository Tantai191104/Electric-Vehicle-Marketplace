import { motion, type Variants } from "framer-motion";
import { FiCheck, FiArrowRight } from "react-icons/fi";
import type { SubscriptionPlan } from "@/types/subscriptionTypes";

interface PlanCardProps {
    plan: SubscriptionPlan;
    isSelected: boolean;
    isHovered: boolean;
    onSelect: () => void;
    onHover: () => void;
    onLeave: () => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
    plan,
    isSelected,
    isHovered,
    onSelect,
    onHover,
    onLeave
}) => {
    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.div
            variants={cardVariants}
            onHoverStart={onHover}
            onHoverEnd={onLeave}
            className={`relative ${plan.popular ? 'lg:scale-105' : ''}`}
        >
            {/* Badges */}
            {plan.popular && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20"
                >
                    <div className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Phổ biến nhất
                    </div>
                </motion.div>
            )}

            {plan.recommended && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20"
                >
                    <div className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Được đề xuất
                    </div>
                </motion.div>
            )}

            <motion.div
                className={`h-full rounded-lg border bg-white transition-all duration-300 overflow-hidden ${isSelected ? 'border-gray-900 shadow-lg' :
                    plan.popular ? 'border-gray-300 shadow-md' :
                        'border-gray-200 shadow-sm hover:shadow-md'
                    }`}
                whileHover={{
                    y: -4,
                    transition: { duration: 0.2 }
                }}
            >
                {/* Header */}
                <div className="p-6 text-center border-b border-gray-100">
                    {/* Icon */}
                    <motion.div
                        className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50 mb-4 text-gray-700"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        {plan.icon}
                    </motion.div>

                    <div className="flex items-center justify-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {plan.name}
                        </h3>
                        {plan.badge && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                                {plan.badge}
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-gray-500 mb-4">
                        {plan.suitable}
                    </p>

                    {/* Price */}
                    <div className="mb-6">
                        {plan.price === 0 ? (
                            <div>
                                <div className="text-4xl font-bold text-gray-900">
                                    Miễn phí
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    {plan.duration}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-lg text-gray-500">₫</span>
                                    <span className="text-4xl font-bold text-gray-900">
                                        {(plan.price / 1000).toFixed(0)}k
                                    </span>
                                    <span className="text-sm text-gray-500">VNĐ</span>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    per {plan.duration}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CTA Button */}
                    <motion.button
                        onClick={onSelect}
                        className="w-full bg-gray-900 hover:bg-black text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {plan.price === 0 ? 'Tạo tài khoản miễn phí' : 'Bắt đầu dùng thử'}
                        <FiArrowRight className="w-4 h-4" />
                    </motion.button>
                </div>

                {/* Features */}
                <div className="p-6">
                    <div className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                            <motion.div
                                key={featureIndex}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + featureIndex * 0.1 }}
                                className="flex items-start gap-3"
                            >
                                <div className="flex-shrink-0 w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                                    <FiCheck className="w-2.5 h-2.5 text-gray-600" />
                                </div>
                                <span className="text-sm text-gray-600 leading-relaxed">
                                    {feature}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Bonuses */}
                    {plan.bonuses && plan.bonuses.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                                Tính năng bổ sung
                            </div>
                            <div className="space-y-2">
                                {plan.bonuses.map((bonus, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                        </div>
                                        <span className="text-xs text-gray-500 leading-relaxed">
                                            {bonus}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Hover Overlay */}
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gray-50/20 rounded-lg pointer-events-none"
                    />
                )}
            </motion.div>
        </motion.div>
    );
};