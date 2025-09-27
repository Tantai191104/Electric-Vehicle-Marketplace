import { useParams, useNavigate } from "react-router-dom";
import { ImageGallery } from "./components/ImageGallery";
import { GuaranteeBadges } from "./components/GuaranteeBadges";
import { SocialShare } from "./components/SocialShare";
import { SpecificationTable } from "./components/SpecificationTable";
import { ActionButtons } from "./components/ActionButtons";
import { ProductHeader } from "./components/ProductHeader";
import { ProductDescription } from "./components/ProductDescriptionProps";
import { ProductStats } from "./components/ProductStats";
import { useProduct } from "@/hooks/useProduct";
import { useCreateConversation } from "@/hooks/useChat";
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
    const handleContact = async (): Promise<void> => {
        if (!user) {
            toast.error("Bạn cần đăng nhập để liên hệ với người bán");
            navigate('/auth/login');
            return;
        }
        if (user._id === product.seller) {
            toast.error("Bạn không thể liên hệ với chính mình");
            return;
        }

        try {
            toast.loading("Đang tạo cuộc hội thoại...");
            console.log("Creating conversation with:", {
                productId: product._id,
                sellerId: product.seller._id
            });
            const conversation = await createConversation.mutateAsync({
                productId: product._id,
                sellerId: product.seller._id
            });

            toast.success("Tạo cuộc hội thoại thành công!");

            // Đợi một chút để React Query invalidate và refetch data
            await new Promise(resolve => setTimeout(resolve, 500));

            // Navigate to chat page - ChatPage sẽ tự động fetch đúng data từ server
            navigate(`/chat/${conversation._id}`);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo cuộc hội thoại";
            toast.error(errorMessage);
            console.error("Error creating conversation:", error);
        }
    };

    const handleFavorite = (): void => {
        if (!user) {
            toast.error("Bạn cần đăng nhập để thích sản phẩm");
            navigate('/auth/login');
            return;
        }

        // TODO: Implement favorite functionality
        console.log("Favorite clicked for:", product._id);
        toast.success("Đã thêm vào danh sách yêu thích!");
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
                        isContactLoading={createConversation.isPending}
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
