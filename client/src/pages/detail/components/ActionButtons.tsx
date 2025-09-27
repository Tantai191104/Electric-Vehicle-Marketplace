import { FiZap, FiHeart } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface ActionButtonsProps {
    likes: number;
    onContact: () => void;
    onFavorite: () => void;
    className?: string;
    disabled?: boolean;
    isContactLoading?: boolean;
    isFavoriteLoading?: boolean;
}

export function ActionButtons({
    likes,
    onContact,
    onFavorite,
    className = "",
    disabled = false,
    isContactLoading = false,
    isFavoriteLoading = false
}: ActionButtonsProps) {
    return (
        <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
            <button
                onClick={onContact}
                disabled={disabled || isContactLoading}
                className="bg-yellow-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center justify-center gap-2 flex-1"
            >
                {isContactLoading ? (
                    <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />
                ) : (
                    <FiZap className="w-4 h-4" />
                )}
                {isContactLoading ? "Đang tạo cuộc hội thoại..." : "Liên hệ mua ngay"}
            </button>
            <button
                onClick={onFavorite}
                disabled={disabled || isFavoriteLoading}
                className="border-2 border-yellow-500 px-6 py-2.5 rounded-xl font-semibold text-yellow-600 bg-white hover:bg-yellow-50 disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md flex items-center justify-center gap-2 flex-1"
            >
                {isFavoriteLoading ? (
                    <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />
                ) : (
                    <FiHeart className="w-4 h-4" />
                )}
                {isFavoriteLoading ? "Đang xử lý..." : `Yêu thích (${likes})`}
            </button>
        </div>
    );
}