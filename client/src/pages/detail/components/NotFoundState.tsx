import { BiErrorCircle } from "react-icons/bi";

interface NotFoundStateProps {
    title?: string;
    message?: string;
    onGoBack?: () => void;
}

export function NotFoundState({
    title = "Không tìm thấy sản phẩm",
    message = "Sản phẩm bạn đang tìm không tồn tại",
    onGoBack
}: NotFoundStateProps) {
    return (
        <div className="max-w-7xl mx-auto mt-18 md:mt-36 bg-white rounded-2xl shadow-lg p-4 md:p-8">
            <div className="text-center py-12">
                <BiErrorCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 mb-4">{message}</p>
                {onGoBack && (
                    <button
                        onClick={onGoBack}
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                    >
                        Quay lại
                    </button>
                )}
            </div>
        </div>
    );
}