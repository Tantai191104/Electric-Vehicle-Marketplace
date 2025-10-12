import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message = "Đang tải thông tin xe điện..." }: LoadingStateProps) {
    return (
        <div className="max-w-7xl mx-auto mt-18 md:mt-36 bg-white rounded-2xl shadow-lg p-4 md:p-8">
            <div className="text-center py-12">
                <AiOutlineLoading3Quarters className="w-8 h-8 mx-auto mb-4 text-yellow-500 animate-spin" />
                <p className="text-gray-600">{message}</p>
            </div>
        </div>
    );
}