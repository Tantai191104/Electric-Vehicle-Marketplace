import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";
import type { AdminSubscription } from "@/types/subscriptionType";

type Props = {
    plan: AdminSubscription;
    onEdit: (id: string) => void;
    onToggleActive: (id: string) => void;
    loading?: boolean;
};

function PlanCard({ plan: p, onEdit, onToggleActive, loading = false }: Props) {
    const isPro = p.key === "pro";
    const isTrial = p.key === "trial";

    const headerColor = isPro
        ? "bg-emerald-600 text-white"
        : isTrial
            ? "bg-amber-400 text-black"
            : "bg-gray-100 text-gray-900";

    return (
        <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-200">
            {/* Header */}
            <div className={`p-4 ${headerColor}`}>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <div className="text-right">
                        <div className="text-2xl font-bold">
                            {(p.priceVnd ?? p.price ?? 0).toLocaleString()}₫
                        </div>
                        <div className="text-xs opacity-80">
                            /{p.billingCycle ?? p.duration ?? "tháng"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <CardContent className="p-5 space-y-4">
                <p className="text-sm text-gray-600">{p.description}</p>

                {/* Quotas */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <Quota label="Số tin mỗi tháng" value={p.quotas?.maxListingsPerCycle} />
                    <Quota label="Tin nổi bật mỗi tháng" value={p.quotas?.maxHighlightsPerCycle} />
                    <Quota label="Lượt dùng AI mỗi tháng" value={p.quotas?.aiUsagePerCycle} />
                    <Quota label="Giờ nổi bật mỗi tin" value={p.quotas?.highlightHoursPerListing} />
                    <Quota label="Thời gian chờ giữa các tin (ngày)" value={p.quotas?.cooldownDaysBetweenListings} />
                </div>

                {/* Features */}
                <div>
                    <h4 className="text-xs text-gray-500 mb-1">Tính năng kèm theo:</h4>
                    <div className="flex flex-wrap gap-2">
                        {p.features?.aiAssist && <FeatureTag text="Hỗ trợ AI" color="emerald" />}
                        {p.features?.priorityBoost && (
                            <FeatureTag text="Ưu tiên hiển thị" color="yellow" />
                        )}
                        {p.features?.manualReviewBypass && (
                            <FeatureTag text="Bỏ qua kiểm duyệt thủ công" color="slate" />
                        )}
                        {p.features?.supportLevel && p.features.supportLevel !== "none" && (
                            <FeatureTag
                                text={`Hỗ trợ: ${translateSupportLevel(p.features.supportLevel)}`}
                                color="blue"
                            />
                        )}
                        {!p.features && (
                            <span className="text-xs text-gray-400">
                                Không có tính năng đặc biệt
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t flex items-center justify-between">
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(String(p._id ?? p.id ?? p.key))}
                            disabled={loading}
                        >
                            Chỉnh sửa
                            {loading && <SpinnerSmall />}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onToggleActive(String(p._id ?? p.id ?? p.key))}
                            disabled={loading}
                            variant={p.isActive ? "destructive" : "default"}
                        >
                            {loading ? "Đang xử lý..." : p.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        </Button>
                    </div>

                    {p.isActive ? (
                        <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                            Đang hoạt động
                        </span>
                    ) : (
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                            Không hoạt động
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

/* Helper components */
function Quota({
    label,
    value,
}: {
    label: string;
    value?: number | string | null;
}) {
    return (
        <div className="flex justify-between bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
            <span>{label}</span>
            <strong>{value ?? 0}</strong>
        </div>
    );
}

function FeatureTag({
    text,
    color,
}: {
    text: string;
    color: "emerald" | "yellow" | "slate" | "blue";
}) {
    const colorMap: Record<string, string> = {
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
        yellow: "bg-yellow-50 text-yellow-700 border-yellow-100",
        slate: "bg-slate-50 text-slate-700 border-slate-100",
        blue: "bg-blue-50 text-blue-700 border-blue-100",
    };
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 border rounded-full text-xs font-medium ${colorMap[color]}`}
        >
            {text}
        </span>
    );
}

function SpinnerSmall() {
    return (
        <svg
            className="animate-spin ml-2 h-3 w-3 text-gray-500 inline-block"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
        </svg>
    );
}

/* 🔤 Translate support level to Vietnamese */
function translateSupportLevel(level: string) {
    switch (level) {
        case "basic":
            return "Cơ bản";
        case "standard":
            return "Tiêu chuẩn";
        case "premium":
            return "Cao cấp";
        default:
            return level;
    }
}

export default React.memo(PlanCard);
