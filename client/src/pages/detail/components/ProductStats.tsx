import { FiHeart, FiEye } from "react-icons/fi";

interface ProductStatsProps {
    likes: number;
    views: number;
    updatedAt: string;
    className?: string;
}

export function ProductStats({ likes, views, updatedAt, className = "" }: ProductStatsProps) {
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <div className={`flex items-center justify-between bg-gray-50 rounded-xl p-3 ${className}`}>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-red-600">
                    <FiHeart className="w-4 h-4" />
                    <span className="text-sm font-medium">{likes}</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-600">
                    <FiEye className="w-4 h-4" />
                    <span className="text-sm font-medium">{views}</span>
                </div>
            </div>
            <div className="text-xs text-gray-500">
                {formatDate(updatedAt)}
            </div>
        </div>
    );
}
