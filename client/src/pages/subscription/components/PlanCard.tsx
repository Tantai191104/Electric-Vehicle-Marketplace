import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
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
    onLeave,
}) => {
    return (
        <motion.div
            onHoverStart={onHover}
            onHoverEnd={onLeave}
            className={`relative transition-all duration-200 ${plan.popular ? 'lg:scale-105' : ''}`}
        >
            {/* Badges */}
            {plan.popular && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20"
                >
                    <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                        PRO
                    </div>
                </motion.div>
            )}

            <motion.div
                className={`h-full rounded-2xl border border-gray-100 bg-white shadow-[0_2px_16px_0_rgba(0,0,0,0.04)] transition-all duration-300 overflow-hidden ${isSelected ? 'border-gray-900 shadow-lg' : 'hover:shadow-lg'} ${plan.popular ? 'border-emerald-200' : ''}`}
                whileHover={{ y: -2, scale: 1.01, transition: { duration: 0.18 } }}
            >
                {/* Header */}
                <div className="p-6 text-center border-b border-gray-50">
                    <motion.div
                        className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 mb-4 text-gray-700 shadow-sm"
                        whileHover={{ scale: 1.07 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        {plan.icon}
                    </motion.div>

                    <div className="flex items-center justify-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                            {plan.name}
                        </h3>
                        {plan.badge && (
                            <span className="px-2 py-1 bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 rounded-full text-xs font-semibold shadow-sm">
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
                                    {plan.duration.replace('monthly', 'tháng').replace('chu kỳ', 'tháng')}
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
                                    /{plan.duration.replace('monthly', 'tháng').replace('chu kỳ', 'tháng')}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CTA Button */}
                    <motion.button
                        onClick={onSelect}
                        className="w-full bg-gradient-to-r from-gray-900 to-emerald-700 hover:from-black hover:to-emerald-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {plan.price === 0 ? 'Tạo tài khoản miễn phí' : 'Bắt đầu dùng thử'}
                        <FiArrowRight className="w-4 h-4" />
                    </motion.button>
                </div>

                {/* Features & Quotas */}
                <div className="p-6">
                    {/* Quotas summary from server (if present) */}
                    {plan.quotas && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6">
                            <div className="flex flex-col gap-4">
                                <div>
                                    <span className="font-medium block mb-1">Tin đăng tối đa mỗi tháng</span>
                                    <span className="block text-gray-700">{plan.quotas?.maxListingsPerCycle && plan.quotas.maxListingsPerCycle > 0 ? `${plan.quotas.maxListingsPerCycle} tin` : 'Không giới hạn'}</span>
                                </div>
                                <div>
                                    <span className="font-medium block mb-1">Tin nổi bật tối đa mỗi tháng</span>
                                    <span className="block text-gray-700">{plan.quotas?.maxHighlightsPerCycle && plan.quotas.maxHighlightsPerCycle > 0 ? `${plan.quotas.maxHighlightsPerCycle} tin` : 'Không có'}</span>
                                </div>
                                <div>
                                    <span className="font-medium block mb-1">Số lần sử dụng AI mỗi tháng</span>
                                    <span className="block text-gray-700">{plan.quotas?.aiUsagePerCycle && plan.quotas.aiUsagePerCycle > 0 ? `${plan.quotas.aiUsagePerCycle} lần` : 'Không có'}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <span className="font-medium block mb-1">Giờ nổi bật mỗi tin</span>
                                    <span className="block text-gray-700">{plan.quotas?.highlightHoursPerListing && plan.quotas.highlightHoursPerListing > 0 ? `${plan.quotas.highlightHoursPerListing} giờ` : 'Không có'}</span>
                                </div>
                                <div>
                                    <span className="font-medium block mb-1">Thời gian chờ giữa các lần đăng</span>
                                    <span className="block text-gray-700">{plan.quotas?.cooldownDaysBetweenListings && plan.quotas.cooldownDaysBetweenListings > 0 ? `${plan.quotas.cooldownDaysBetweenListings} ngày` : 'Không có'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-wrap gap-3 mb-4">
                        {/* Structured features (boolean flags) */}
                        {plan.featuresObj && (
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${plan.featuresObj.aiAssist ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>Hỗ trợ AI thông minh</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${plan.featuresObj.priorityBoost ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'}`}>Ưu tiên hiển thị</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${plan.featuresObj.manualReviewBypass ? 'bg-slate-100 text-slate-700' : 'bg-gray-100 text-gray-400'}`}>Bỏ qua kiểm duyệt thủ công</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${plan.featuresObj.supportLevel !== 'none' && !!plan.featuresObj.supportLevel ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>Hỗ trợ: {plan.featuresObj.supportLevel === 'none' ? 'Không có' : plan.featuresObj.supportLevel === 'priority' ? 'Ưu tiên' : plan.featuresObj.supportLevel}</span>
                            </div>
                        )}
                    </div>

                    {/* Bonuses */}
                    {plan.bonuses && plan.bonuses.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-50">
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
