import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Video, MoreHorizontal } from "lucide-react";


interface ChatHeaderProps {
    user: {
        id: string;
        name: string
        avatar: string | null;

    }
    isOnline?: boolean;
    product?: {
        title: string;
        images: string[];
    };
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ user, isOnline, product }) => (
    <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
            {/* Avatar */}
            <Avatar className="h-10 w-10">
                {user.avatar ? (
                    <AvatarImage src={user.avatar} />
                ) : (
                    <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                        {user.name.charAt(0)}
                    </AvatarFallback>
                )}
            </Avatar>

            <div className="flex flex-col">
                <h3 className="font-medium text-gray-900 text-sm flex items-center gap-2">
                    {user.name}
                    {/* Thumbnail sản phẩm nếu có */}
                    {product?.images[0] && (
                        <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-5 h-5 rounded-sm object-cover"
                        />
                    )}
                </h3>
                <span className={`text-xs ${isOnline ? "text-green-600" : "text-gray-400"}`}>
                    {isOnline ? "Hoạt động" : "Offline"}
                </span>
            </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-600">
                <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-600">
                <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-600">
                <MoreHorizontal className="h-4 w-4" />
            </Button>
        </div>
    </div>
);
