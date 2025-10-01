import { FiShield, FiZap } from "react-icons/fi";
import type { IconType } from "react-icons/lib";


interface Badge {
    icon: IconType;
    text: string;
    iconColor: string;
}

interface GuaranteeBadgesProps {
    className?: string;
}

export function GuaranteeBadges({ className = "" }: GuaranteeBadgesProps) {
    const badges: Badge[] = [
        {
            icon: FiShield,
            text: "Bảo hành chính hãng",
            iconColor: "text-pink-500"
        },
        {
            icon: FiZap,
            text: "Cam kết thông số chuẩn",
            iconColor: "text-blue-500"
        }
    ];

    return (
        <div className={`flex gap-2 flex-wrap ${className}`}>
            {badges.map((badge, index) => {
                const IconComponent = badge.icon;
                return (
                    <div key={index} className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-lg font-medium text-xs">
                        <IconComponent className={`${badge.iconColor} w-3 h-3`} />
                        {badge.text}
                    </div>
                );
            })}
        </div>
    );
}