import { useParams, useNavigate } from "react-router-dom";

import { ImageGallery } from "./components/ImageGallery";
import { GuaranteeBadges } from "./components/GuaranteeBadges";
import { SocialShare } from "./components/SocialShare";
import { SpecificationTable } from "./components/SpecificationTable";
import { ActionButtons } from "./components/ActionButtons";
import { ProductHeader } from "./components/ProductHeader";
import { ProductDescription } from "./components/ProductDescriptionProps";
import { ProductStats } from "./components/ProductStats";
import { useAddWishlist, useRemoveWishlist, useProduct, useAddToCart } from "@/hooks/useProduct";
import { useCreateConversation, useFindExistingConversation } from "@/hooks/useChat";
import { useAuthStore } from "@/store/auth";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { NotFoundState } from "./components/NotFoundState";
import { toast } from "sonner";

interface ProductDetailPageProps {
    className?: string;
}

export default function ProductDetailPage({ className = "" }: ProductDetailPageProps) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, isLoading, error, refetch } = useProduct(id ?? "");
    const createConversation = useCreateConversation();
    const findExistingConversation = useFindExistingConversation();
    const addWishlist = useAddWishlist();
    const removeWishlist = useRemoveWishlist();
    const addToCart = useAddToCart();
    const { user } = useAuthStore();

    if (isLoading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState onRetry={() => refetch()} />;
    }

    if (!data) {
        return <NotFoundState onGoBack={() => navigate(-1)} />;
    }

    const product = data;
    console.log("Product data:", product);
    const handleContact = async (): Promise<void> => {
        if (!user) {
            toast.error("Bạn cần đăng nhập để liên hệ với người bán");
            navigate('/auth/login');
            return;
        }
        if (user._id === product.seller._id) {
            toast.error("Bạn không thể liên hệ với chính mình");
            return;
        }

        try {
            const existingConversation = findExistingConversation(product._id, product.seller._id);

            if (existingConversation) {
                toast.success("Chuyển đến cuộc hội thoại hiện có!");
                navigate(`/chat/${existingConversation._id}`);
                return;
            }

            const toastId = toast.loading("Đang tạo cuộc hội thoại...");
            console.log("Creating new conversation with:", {
                productId: product._id,
                sellerId: product.seller._id
            });

            const newConversation = await createConversation.mutateAsync({
                productId: product._id,
                sellerId: product.seller._id
            });

            toast.dismiss(toastId);
            toast.success("Tạo cuộc hội thoại thành công!");

            await new Promise(resolve => setTimeout(resolve, 500));

            navigate(`/chat/${newConversation._id}`);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo cuộc hội thoại";
            toast.error(errorMessage);
            console.error("Error creating conversation:", error);
        }
    };

    const handleFavorite = async (): Promise<void> => {
        if (!user) {
            toast.error("Bạn cần đăng nhập để thích sản phẩm");
            navigate('/auth/login');
            return;
        }

        try {
            // Check if product is already in wishlist
            if (product.isInWishlist) {
                await removeWishlist.mutateAsync(product._id);
            } else {
                await addWishlist.mutateAsync(product._id);
            }
        } catch (error) {
            // Error đã được handle trong hook
            console.error("Failed to toggle wishlist:", error);
        }
    };

    const handleBuyNow = async (): Promise<void> => {
        if (!user) {
            toast.error("Bạn cần đăng nhập để mua hàng");
            navigate('/auth/login');
            return;
        }

        if (user._id === product.seller) {
            toast.error("Bạn không thể mua sản phẩm của chính mình");
            return;
        }

        try {
            // For battery products, redirect to checkout page
            if (product.category === 'battery') {
                toast.success("Chuyển đến trang thanh toán...");
                navigate(`/checkout?productId=${product._id}&quantity=1`);
            } else {
                // For other products, add to cart first then redirect
                await addToCart.mutateAsync({ productId: product._id, quantity: 1 });
                navigate('/checkout');
            }
        } catch (error) {
            // Error đã được handle trong hook
            console.error("Failed to process buy now:", error);
        }
    };

    return (
        <div
            className={`max-w-7xl mx-auto mt-18 md:mt-36 bg-white rounded-2xl shadow-lg p-4 md:p-6 ${className}`}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Left Column */}
                <div>
                    <ImageGallery images={product.images} brand={product.brand} model={product.model} />

                    <GuaranteeBadges className="mt-4 md:mt-5" />

                    <SocialShare
                        className="mt-4 md:mt-5"
                        productName={`${product.brand} ${product.model}`}
                        productUrl={window.location.href}
                    />

                    <ProductDescription
                        description={product.description || product.additionalInfo || ""}
                        className="mt-4 md:mt-5"
                    />
                </div>

                {/* Right Column */}
                <div>
                    <ProductHeader car={product} className="mb-5" />

                    <ActionButtons
                        likes={product.likes}
                        onContact={handleContact}
                        onFavorite={handleFavorite}
                        onBuyNow={handleBuyNow}
                        isContactLoading={createConversation.isPending}
                        isInWishlist={product.isInWishlist || false}
                        isFavoriteLoading={addWishlist.isPending || removeWishlist.isPending}
                        isBuyNowLoading={addToCart.isPending}
                        category={product.category}
                        className="mb-5"
                    />

                    <ProductStats
                        likes={product.likes}
                        views={product.views}
                        updatedAt={product.updatedAt}
                        className="mb-4"
                    />

                    <SpecificationTable product={product} />
                </div>
            </div>
        </div>
    );
}
