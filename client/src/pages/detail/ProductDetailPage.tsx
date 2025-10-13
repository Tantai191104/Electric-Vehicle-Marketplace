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
import { useCreateConversation, useFindExistingConversation } from "@/hooks/useChat";
import { useAuthStore } from "@/store/auth";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { NotFoundState } from "./components/NotFoundState";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface ProductDetailPageProps {
    className?: string;
}

export default function ProductDetailPage({ className = "" }: ProductDetailPageProps) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, isLoading, error, refetch } = useProduct(id ?? "");
    const createConversation = useCreateConversation();
    const findExistingConversation = useFindExistingConversation();
    const { user } = useAuthStore();

    // Loading & Error states
    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState onRetry={() => refetch()} />;
    if (!data?.product) return <NotFoundState onGoBack={() => navigate(-1)} />;

    const product = data.product;

    const handleContact = async (): Promise<void> => {
        if (!user) {
            toast.error("Bạn cần đăng nhập để liên hệ với người bán");
            navigate("/auth/login");
            return;
        }

        if (!product?.seller?._id) {
            toast.error("Thông tin sản phẩm hoặc người bán không hợp lệ");
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
            const newConversation = await createConversation.mutateAsync({
                productId: product._id,
                sellerId: product.seller._id,
            });

            toast.dismiss(toastId);
            toast.success("Tạo cuộc hội thoại thành công!");
            navigate(`/chat/${newConversation._id}`);
        } catch (error) {
            toast.dismiss();

            if (error instanceof AxiosError) {
                console.error("Axios error:", error.response?.data);
                const message =
                    (error.response?.data as { message?: string })?.message ||
                    "Lỗi từ máy chủ. Vui lòng thử lại.";
                toast.error(message);
            } else if (error instanceof Error) {
                // Trường hợp lỗi JS thông thường
                console.error("Error creating conversation:", error.message);
                toast.error(error.message);
            } else {
                // Trường hợp lỗi không xác định (rare)
                console.error("Unknown error:", error);
                toast.error("Có lỗi xảy ra khi tạo cuộc hội thoại");
            }
        }
    };


    // 🟢 Handle buy now
    const handleBuyNow = async (): Promise<void> => {
        if (!user) {
            toast.error("Bạn cần đăng nhập để mua hàng");
            navigate("/auth/login");
            return;
        }

        if (user._id === product.seller._id) {
            toast.error("Bạn không thể mua sản phẩm của chính mình");
            return;
        }

        if (product.category === "battery") {
            toast.success("Chuyển đến trang thanh toán...");
            navigate(`/checkout/${product._id}/1`);
            return;
        }

        if (product.category === "vehicle") {
            let toastId;
            try {
                toastId = toast.loading("Đang tạo đơn đặt cọc xe...");

                const depositPayload = {
                    product_id: product._id,
                    seller_id: product.seller._id,
                    buyer_name: user.name,
                    buyer_phone: user.phone || "",
                    buyer_address: typeof user.profile?.address === "string" ? user.profile.address : "",
                };
                console.log(depositPayload);
                const { orderServices } = await import("@/services/orderServices");
                await orderServices.createDepositOrder(depositPayload);

                toast.dismiss(toastId);
                toast.success("Đặt cọc xe thành công!");
                navigate(`/checkout/${product._id}/deposit`);
            } catch (error: unknown) {
                toast.dismiss(toastId);
                console.error("Error creating deposit:", error);
                let message = "Có lỗi khi đặt cọc xe. Vui lòng thử lại.";
                if (typeof error === "object" && error && "response" in error) {
                    // @ts-expect-error dynamic error response typing
                    message = error.response?.data?.message || message;
                }
                toast.error(message);
            }
        }
    };
    // 🟢 Handle schedule appointment (deposit flow)
    const handleScheduleAppointment = async (): Promise<void> => {
        if (!user) {
            toast.error("Bạn cần đăng nhập để lên lịch hẹn");
            navigate("/auth/login");
            return;
        }

        if (user._id === product.seller._id) {
            toast.error("Bạn không thể lên lịch hẹn với chính mình");
            return;
        }

        if (product.category === "vehicle") {
            try {
                toast.success("Chuyển đến trang thanh toán...");
                navigate(`/checkout/${product._id}/deposit`);
            } catch (error) {
                console.error("Error navigating to checkout:", error);
                toast.error("Không thể chuyển đến trang thanh toán. Vui lòng thử lại.");
            }
        } else {
            toast.error("Chỉ xe mới có thể lên lịch hẹn.");
        }
    };


    return (
        <div className={`max-w-7xl mx-auto mt-18 md:mt-36 bg-white rounded-2xl shadow-lg p-4 md:p-6 ${className}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Left Column */}
                <div>
                    <ImageGallery images={product.images} brand={product.brand} model={product.model} />
                    <GuaranteeBadges className="mt-4 md:mt-5" />
                    <SocialShare className="mt-4 md:mt-5" productName={`${product.brand} ${product.model}`} productUrl={window.location.href} />
                    <ProductDescription description={product.description || ""} className="mt-4 md:mt-5" />
                </div>

                {/* Right Column */}
                <div>
                    <ProductHeader car={product} className="mb-5" />
                    <ActionButtons
                        onContact={handleContact}
                        onBuyNow={handleBuyNow}
                        onContract={handleScheduleAppointment}
                        isContactLoading={createConversation.isPending}
                        isInWishlist={product.isInWishlist || false}
                        category={product.category}
                        className="mb-5"
                    />
                    <ProductStats likes={product.likes} views={product.views} updatedAt={product.updatedAt} className="mb-4" />
                    <SpecificationTable product={product} />
                </div>
            </div>
        </div>
    );
}
