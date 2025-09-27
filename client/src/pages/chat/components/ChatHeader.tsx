import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Video, MoreHorizontal } from "lucide-react";

interface ChatHeaderProps {
    user?: {
        id?: string;
        name?: string;
        avatar?: string | null;
    };
    isOnline?: boolean;
    product?: {
        title?: string;
        images?: string[];
    };
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    user,
    isOnline = false,
    product,
}) => {
    const initial = user?.name?.charAt(0).toUpperCase() ?? "?";
    const displayName = user?.name ?? "Người dùng";

    return (
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <Avatar className="h-10 w-10 rounded-full border border-gray-600">
                    {user?.avatar ? (
                        <AvatarImage src={user.avatar} alt={displayName} />
                    ) : (
                        <AvatarFallback className="bg-gray-600 text-gray-200 text-sm">
                            {initial}
                        </AvatarFallback>
                    )}
                </Avatar>

                <div className="flex flex-col">
                    <h3 className="font-medium text-gray-100 text-sm flex items-center gap-2">
                        {displayName}
                        {/* Thumbnail sản phẩm nếu có */}
                        {product?.images?.[0] && (
                            <img
                                src={product.images[0]}
                                alt={product.title ?? "Sản phẩm"}
                                className="w-5 h-5 rounded-md object-cover border border-gray-600"
                            />
                        )}
                    </h3>
                    <span
                        className={`text-xs ${isOnline ? "text-green-400" : "text-gray-400"
                            }`}
                    >
                        {isOnline ? "Hoạt động" : "Offline"}
                    </span>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg hover:bg-gray-700 text-gray-200"
                >
                    <Phone className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg hover:bg-gray-700 text-gray-200"
                >
                    <Video className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg hover:bg-gray-700 text-gray-200"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
