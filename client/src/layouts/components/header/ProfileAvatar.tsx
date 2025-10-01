import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type Props = {
    user?: {
        name?: string;
    };
};

export default function ProfileAvatar({ user }: Props) {
    return (
        <div className="relative mb-2 flex items-center justify-center">
            {/* Avatar */}
            <Avatar className="w-16 h-16">
                {/* Ảnh fallback bằng chữ cái đầu */}
                <AvatarFallback className="bg-blue-400 text-white text-2xl font-bold">
                    {user?.name?.[0] || "U"}
                </AvatarFallback>
            </Avatar>

            {/* Nút sửa avatar */}
            <Button
                asChild
                size="icon"
                variant="outline"
                className="absolute bottom-1 right-1 h-7 w-7 rounded-full border border-gray-300 shadow bg-white hover:bg-gray-100"
            >
                <Link to="/profile">
                    <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5l-4 1 1-4L16.5 3.5z" />
                    </svg>
                </Link>
            </Button>
        </div>
    );
}
