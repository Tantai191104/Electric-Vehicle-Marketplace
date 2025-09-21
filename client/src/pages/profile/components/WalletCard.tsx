import React from "react";
import { FaWallet } from "react-icons/fa";

interface WalletCardProps {
    balance: number;
    membership?: string; // Gói thành viên
}

const WalletCard: React.FC<WalletCardProps> = ({ balance, membership }) => {
    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 w-full max-w-md mx-auto">
            {/* Icon */}
            <div className="bg-yellow-100 rounded-full p-5 flex-shrink-0">
                <FaWallet className="text-4xl text-yellow-500" />
            </div>

            {/* Info */}
            <div className="flex-1 w-full">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-gray-700 font-semibold text-lg">Ví của bạn</div>
                        <div className="text-3xl font-bold text-yellow-600 mt-1">
                            {balance.toLocaleString("vi-VN")}₫
                        </div>
                        <div className="text-gray-400 text-sm mt-1">Số dư hiện tại</div>
                    </div>
                    {/* Nâng cấp gói */}
                    {membership && (
                        <button className="bg-yellow-500 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-yellow-600 transition-shadow shadow-md">
                            Nâng cấp gói
                        </button>
                    )}
                </div>

                {/* Thẻ thành viên */}
                {membership && (
                    <div className="mt-4">
                        <span className="inline-block bg-yellow-200 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                            Gói thành viên: {membership}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WalletCard;
