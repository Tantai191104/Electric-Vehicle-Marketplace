import type { JSX } from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

interface SocialLink {
    platform: string;
    icon: JSX.Element;
    url?: string;
}

interface SocialShareProps {
    className?: string;
    productUrl?: string;
    productName?: string;
}

export function SocialShare({ className = "", productUrl = "", productName = "" }: SocialShareProps) {
    const socialLinks: SocialLink[] = [
        { platform: "facebook", icon: <FaFacebookF /> },
        { platform: "twitter", icon: <FaTwitter /> },
        { platform: "instagram", icon: <FaInstagram /> },
        { platform: "youtube", icon: <FaYoutube /> },
    ];

    const handleShare = (platform: string) => {
        // Ở đây bạn có thể implement logic share
        console.log(`Sharing ${productName} on ${platform}`, productUrl);
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <span className="text-gray-500 font-medium text-sm">Chia sẻ:</span>
            {socialLinks.map((link) => (
                <button
                    key={link.platform}
                    onClick={() => handleShare(link.platform)}
                    className="text-gray-500 hover:text-black transition-colors text-lg"
                    aria-label={`Share on ${link.platform}`}
                >
                    {link.icon}
                </button>
            ))}
        </div>
    );
}
