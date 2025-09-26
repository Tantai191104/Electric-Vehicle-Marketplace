import React from "react";
import { FaWallet } from "react-icons/fa";

interface WalletCardProps {
    balance: number;
    membership?: string;
    small?: boolean;
}

const WalletCard: React.FC<WalletCardProps> = ({ balance, membership, small }) => {
    return (
        <div className={`bg-white rounded-xl shadow p-4 flex items-center gap-4 w-full ${small ? "max-w-xs mx-auto" : "max-w-md mx-auto"}`}>
            <div className={`bg-yellow-100 rounded-full ${small ? "p-3" : "p-5"} flex-shrink-0`}>
                <FaWallet className={`${small ? "text-2xl" : "text-4xl"} text-yellow-500`} />
            </div>
            <div className="flex-1">
                <div className={`text-gray-700 font-semibold ${small ? "text-base" : "text-lg"}`}>Ví của bạn</div>
                <div className={`font-bold text-yellow-600 ${small ? "text-xl" : "text-3xl"} mt-1`}>
                    {balance.toLocaleString("vi-VN")}₫
                </div>
                <div className="text-gray-400 text-sm mt-1">Số dư hiện tại</div>
                {membership && (
                    <span className="inline-block bg-yellow-200 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full mt-2">
                        Gói thành viên: {membership}
                    </span>
                )}
            </div>
        </div>
    );
};

export default WalletCard;
