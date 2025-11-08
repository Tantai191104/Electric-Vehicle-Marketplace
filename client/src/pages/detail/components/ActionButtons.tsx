import { FiZap, FiShoppingBag, FiFileText, FiSettings, FiHeart } from "react-icons/fi";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAddToWishlist, useRemoveFromWishlist, wishlistKeys } from "@/hooks/useWishlist";

interface ActionButtonsProps {
    onContact: () => void;
    onBuyNow?: () => void;
    onContract?: () => void; // thêm prop cho hợp đồng
    className?: string;
    disabled?: boolean;
    isContactLoading?: boolean;
    isBuyNowLoading?: boolean;
    isContractLoading?: boolean; // loading cho hợp đồng
    isInWishlist?: boolean;
    category?: "vehicle" | "battery";
    isOwner?: boolean;
    onManage?: () => void;
    productId?: string;
    onToggleWishlist?: () => void;
}

export function ActionButtons({
    onContact,
    onBuyNow,
    onContract,
    className = "",
    disabled = false,
    isContactLoading = false,
    isBuyNowLoading = false,
    isContractLoading = false,
    isInWishlist = false,
    category = "vehicle",
    isOwner = false,
    onManage,
    productId,
    onToggleWishlist,
}: ActionButtonsProps) {
    // wishlist mutations - keep hooks at top level
    const qc = useQueryClient();
    const addMutation = useAddToWishlist();
    const removeMutation = useRemoveFromWishlist();
    const isWishlistPending = addMutation.status === "pending" || removeMutation.status === "pending";

    const handleToggleWishlist = async () => {
        if (onToggleWishlist) return onToggleWishlist();
        if (!productId) return toast.error("Không có sản phẩm để thêm vào yêu thích");

        try {
            if (isInWishlist) {
                await removeMutation.mutateAsync(productId);
                toast.success("Đã bỏ yêu thích");
            } else {
                await addMutation.mutateAsync(productId);
                toast.success("Đã thêm vào yêu thích");
            }
            qc.invalidateQueries({ queryKey: wishlistKeys.list() });
        } catch (_error) {
            console.error("Wishlist toggle error:", _error);
            toast.error("Thao tác thất bại. Vui lòng thử lại.");
        }
    };
    const ButtonWithIcon = ({
        onClick,
        isLoading,
        icon,
        children,
        type = "primary",
        fullWidth = false,
        iconOnly = false,
        tooltip = ""
    }: {
        onClick: () => void;
        isLoading?: boolean;
        icon?: React.ReactNode;
        children?: React.ReactNode;
        type?: "primary" | "secondary" | "ghost";
        fullWidth?: boolean;
        iconOnly?: boolean;
        tooltip?: string;
    }) => {
        let baseClasses =
            "flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

        if (type === "primary") baseClasses += " bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg rounded-xl";
        if (type === "secondary") baseClasses += " border-2 border-yellow-500 text-yellow-600 bg-white hover:bg-yellow-50 shadow rounded-xl";
        if (type === "ghost") baseClasses += " bg-green-500 text-white hover:bg-green-600 shadow rounded-xl";
        if (iconOnly) baseClasses += " w-11 h-11 rounded-full bg-white border border-yellow-300 hover:bg-yellow-100 text-yellow-600 shadow-md p-0";
        if (fullWidth && !iconOnly) baseClasses += " w-full";

        return (
            <button
                onClick={onClick}
                disabled={disabled || isLoading}
                className={baseClasses + (iconOnly ? "" : " px-6 py-2.5")}
                title={tooltip}
            >
                {isLoading ? (
                    <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />
                ) : (
                    icon
                )}
                {!iconOnly && children}
            </button>
        );
    };

    if (isOwner) {
        // Nếu là sản phẩm của mình, ẩn các thao tác, chỉ hiển thị nút quản lý tin
        return (
            <div className={`flex flex-col gap-3 ${className}`}>
                <ButtonWithIcon onClick={() => (onManage ? onManage() : undefined)} icon={<FiSettings className="w-4 h-4" />} type="secondary" fullWidth>
                    Quản lý tin
                </ButtonWithIcon>
            </div>
        );
    }



    // Layout cho battery: Xem hợp đồng, Mua ngay, Liên hệ
    if (category === "battery") {
        return (
            <TooltipProvider>
                <div className={`flex flex-col gap-4 ${className}`}>
                    <div className="flex gap-3">
                        <ButtonWithIcon
                            onClick={onBuyNow!}
                            isLoading={isBuyNowLoading}
                            icon={<FiShoppingBag className="w-5 h-5" />}
                            type="primary"
                            fullWidth
                        >
                            {isBuyNowLoading ? "Đang xử lý..." : "Mua ngay"}
                        </ButtonWithIcon>
                        <ButtonWithIcon
                            onClick={onContact}
                            isLoading={isContactLoading}
                            icon={<FiZap className="w-4 h-4" />}
                            type="ghost"
                            fullWidth
                        >
                            {isContactLoading ? "Đang tạo cuộc hội thoại..." : "Liên hệ"}
                        </ButtonWithIcon>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <ButtonWithIcon
                                        onClick={onContract!}
                                        isLoading={isContractLoading}
                                        icon={<FiFileText className="w-4 h-4" />}
                                        type="secondary"
                                        iconOnly
                                    />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>Xem hợp đồng</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <ButtonWithIcon
                                        onClick={handleToggleWishlist}
                                        isLoading={isWishlistPending}
                                        icon={<FiHeart className={`w-5 h-5 ${isInWishlist ? "text-red-500" : ""}`} />}
                                        type="secondary"
                                        iconOnly
                                    />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>{isInWishlist ? "Bỏ yêu thích" : "Yêu thích"}</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </TooltipProvider>
        );
    }

    // Layout cho vehicle: Liên hệ, Lên lịch hẹn (đặt cọc)
    return (
        <TooltipProvider>
            <div className={`flex flex-col gap-4 ${className}`}>
                <div className="flex gap-3">
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
                        onClick={onContract!}
                        isLoading={isContractLoading}
                        icon={<FiFileText className="w-4 h-4" />}
                        type="ghost"
                        fullWidth
                    >
                        {isContractLoading ? "Đang xử lý..." : "Lên lịch hẹn (đặt cọc)"}
                    </ButtonWithIcon>
                </div>
                <div className="flex gap-3 justify-end">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <ButtonWithIcon
                                    onClick={handleToggleWishlist}
                                    isLoading={isWishlistPending}
                                    icon={<FiHeart className={`w-5 h-5 ${isInWishlist ? "text-red-500" : ""}`} />}
                                    type="secondary"
                                    iconOnly
                                />
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>{isInWishlist ? "Bỏ yêu thích" : "Yêu thích"}</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );
}
