import { BiErrorCircle } from "react-icons/bi";

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({
    title = "Không thể tải thông tin xe",
    message = "Có lỗi xảy ra khi tải chi tiết sản phẩm",
    onRetry
}: ErrorStateProps) {
    return (
        <div className="max-w-7xl mx-auto mt-18 md:mt-36 bg-white rounded-2xl shadow-lg p-4 md:p-8">
            <div className="text-center py-12">
                <BiErrorCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 mb-4">{message}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                    >
                        Thử lại
                    </button>
                )}
            </div>
        </div>
    );
}
