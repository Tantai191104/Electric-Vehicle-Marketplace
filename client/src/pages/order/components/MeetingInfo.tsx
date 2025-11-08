import React from "react";
import { FiMapPin, FiCalendar, FiUser, FiClock } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";

export interface MeetingData {
    location?: string | null;
    address?: string | null;
    time?: string | number | Date | null;
    // Server may return updatedBy as string id, or as user object.
    updatedBy?:
    | string
    | {
        _id?: string | null;
        name?: string | null;
        email?: string | null;
        role?: string | null;
    }
    | null;
}

interface MeetingInfoProps {
    meetingData?: MeetingData | null;
    compact?: boolean;
    isDepositOrder?: boolean;
    /** If false and meetingData is null/undefined, component returns null (hidden). Default: true */
    showWhenMissing?: boolean;
}

const MeetingInfo: React.FC<MeetingInfoProps> = ({ meetingData, compact = false, isDepositOrder = false, showWhenMissing = true }) => {
    // Consider meeting "missing" when it's null/undefined OR when it contains no useful fields
    const hasInfo = Boolean(
        meetingData && (
            (meetingData.location && String(meetingData.location).trim() !== '') ||
            (meetingData.address && String(meetingData.address).trim() !== '') ||
            (meetingData.time && String(meetingData.time).trim() !== '')
        )
    );

    // If caller explicitly doesn't want the placeholder shown when meeting is missing, hide entirely
    if (!hasInfo && !showWhenMissing) return null;
    // Compact view: small inline display used in the card header
    if (compact) {
        if (!hasInfo) {
            if (isDepositOrder) {
                // Restore compact badge style from original order card
                return (
                    <div className="flex items-center gap-2 ml-4">
                        <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                            Thông tin sẽ được liên hệ trực tiếp với bạn sau
                        </Badge>
                    </div>
                );
            }

            return (
                <div className="flex items-center gap-2 ml-4">
                    <Badge className="bg-yellow-100 text-yellow-800 border-0 text-xs font-semibold px-3 py-1 shadow-sm">
                        Chưa có lịch — Admin đang sắp xếp
                    </Badge>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-1 ml-4">
                <div className="flex items-center gap-1">
                    <FiMapPin className="w-4 h-4" />
                    <span className="font-semibold">Địa điểm gặp mặt:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{meetingData!.location}</span>
                </div>
                <div className="flex items-center gap-1">
                    <FiCalendar className="w-4 h-4" />
                    <span className="font-semibold">Thời gian:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{meetingData!.time ? new Date(meetingData!.time).toLocaleString('vi-VN') : 'Chờ admin xác nhận'}</span>
                </div>
            </div>
        );
    }

    // Full/detailed view used in the Order Details panel
    if (!hasInfo) {
        // If deposit order, show the same blue deposit panel used in ShippingInfoStep for consistency
        if (isDepositOrder) {
            // Restore the original compact deposit info box used in OrderCard when meeting is missing
            return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <FiClock className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-blue-900 text-sm mb-1">Đang xử lý thông tin</p>
                            <p className="text-xs text-blue-700">
                                Thông tin lịch hẹn sẽ được liên hệ trực tiếp với bạn sau. Vui lòng kiểm tra email và điện thoại thường xuyên.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-yellow-50 rounded-lg p-4 shadow-sm flex items-start gap-4 border-l-4 border-yellow-400">
                <div className="flex items-center justify-center flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                        <FiClock className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-yellow-900 text-base mb-2">Chưa có lịch hẹn — Đang chờ admin</p>
                    <p className="text-sm text-yellow-800">
                        Thông tin lịch hẹn sẽ được cập nhật khi admin xác nhận và sắp xếp thời gian gặp mặt. Vui lòng kiểm tra email hoặc tin nhắn từ hệ thống để biết cập nhật mới nhất.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center gap-2 text-sm">
                <FiMapPin className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-black">Địa điểm gặp mặt:</span>
                <span className="text-gray-700">{meetingData!.location}</span>
            </div>
            {meetingData!.address && (
                <div className="flex items-center gap-2 text-sm">
                    <FiMapPin className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-black">Địa chỉ chi tiết:</span>
                    <span className="text-gray-700">{meetingData!.address}</span>
                </div>
            )}
            <div className="flex items-center gap-2 text-sm">
                <FiCalendar className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-black">Thời gian:</span>
                <span className="text-gray-700">{meetingData!.time ? new Date(meetingData!.time).toLocaleString('vi-VN') : 'Chờ admin xác nhận'}</span>
            </div>
            {meetingData!.updatedBy && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-start gap-2 text-xs text-gray-600">
                        <FiUser className="w-3 h-3 mt-0.5" />
                        <div>
                            <p className="font-medium text-gray-700">Được lên lịch bởi:</p>
                            {typeof meetingData!.updatedBy === 'object' ? (
                                <>
                                    <p className="text-gray-600">{meetingData!.updatedBy.name}</p>
                                    <p className="text-gray-500">{meetingData!.updatedBy.email}</p>
                                </>
                            ) : (
                                <p className="text-gray-600">{meetingData!.updatedBy}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MeetingInfo;
