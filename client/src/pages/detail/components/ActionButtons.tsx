import { FiZap, FiHeart, FiShoppingCart } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface ActionButtonsProps {
    likes: number;
    onContact: () => void;
    onFavorite: () => void;
    onAddToCart?: () => void;
    className?: string;
    disabled?: boolean;
    isContactLoading?: boolean;
    isFavoriteLoading?: boolean;
    isAddToCartLoading?: boolean;
    isInWishlist?: boolean;
    category?: "vehicle" | "battery";
}

export function ActionButtons({
    likes,
    onContact,
    onFavorite,
    onAddToCart,
    className = "",
    disabled = false,
    isContactLoading = false,
    isFavoriteLoading = false,
    isAddToCartLoading = false,
    isInWishlist = false,
    category = "vehicle",
}: ActionButtonsProps) {
    const ButtonWithIcon = ({
        onClick,
        isLoading,
        icon,
        children,
        type = "primary",
        fullWidth = false,
    }: {
        onClick: () => void;
        isLoading?: boolean;
        icon?: React.ReactNode;
        children: React.ReactNode;
        type?: "primary" | "secondary" | "ghost";
        fullWidth?: boolean;
    }) => {
        let baseClasses =
            "flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed";

        if (type === "primary") baseClasses += " bg-yellow-500 text-white hover:bg-yellow-600";
        if (type === "secondary") baseClasses +=
            isInWishlist
                ? " border-2 border-red-500 text-red-600 bg-red-50 hover:bg-red-100"
                : " border-2 border-yellow-500 text-yellow-600 bg-white hover:bg-yellow-50";
        if (type === "ghost") baseClasses += " bg-green-500 text-white hover:bg-green-600";

        if (fullWidth) baseClasses += " w-full";

        return (
            <button onClick={onClick} disabled={disabled || isLoading} className={baseClasses + " px-6 py-2.5"}>
                {isLoading ? <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" /> : icon}
                {children}
            </button>
        );
    };

    // Layout cho battery
    if (category === "battery") {
        return (
            <div className={`flex flex-col gap-3 ${className}`}>
                <ButtonWithIcon
                    onClick={onAddToCart!}
                    isLoading={isAddToCartLoading}
                    icon={<FiShoppingCart className="w-5 h-5" />}
                    type="ghost"
                    fullWidth
                >
                    {isAddToCartLoading ? "Đang thêm vào giỏ hàng..." : "Thêm vào giỏ hàng"}
                </ButtonWithIcon>

                <div className="flex flex-col sm:flex-row gap-3">
                    <ButtonWithIcon
                        onClick={onContact}
                        isLoading={isContactLoading}
                        icon={<FiZap className="w-4 h-4" />}
                        type="primary"
                        fullWidth
                    >
                        {isContactLoading ? "Đang tạo cuộc hội thoại..." : "Liên hệ người bán"}
                    </ButtonWithIcon>

                    <ButtonWithIcon
                        onClick={onFavorite}
                        isLoading={isFavoriteLoading}
                        icon={<FiHeart className="w-4 h-4" />}
                        type="secondary"
                        fullWidth
                    >
                        {isFavoriteLoading
                            ? "Đang xử lý..."
                            : isInWishlist
                                ? `Đã thích (${likes})`
                                : `Yêu thích (${likes})`}
                    </ButtonWithIcon>
                </div>
            </div>
        );
    }

    // Layout cho vehicle
    return (
        <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
            <ButtonWithIcon
                onClick={onContact}
                isLoading={isContactLoading}
                icon={<FiZap className="w-4 h-4" />}
                type="primary"
                fullWidth
            >
                {isContactLoading ? "Đang tạo cuộc hội thoại..." : "Liên hệ mua ngay"}
            </ButtonWithIcon>

            <ButtonWithIcon
                onClick={onFavorite}
                isLoading={isFavoriteLoading}
                icon={<FiHeart className="w-4 h-4" />}
                type="secondary"
                fullWidth
            >
                {isFavoriteLoading
                    ? "Đang xử lý..."
                    : isInWishlist
                        ? `Đã thích (${likes})`
                        : `Yêu thích (${likes})`}
            </ButtonWithIcon>
        </div>
    );
}
