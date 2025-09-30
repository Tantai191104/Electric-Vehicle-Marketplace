import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    FiActivity,
    FiUser,
    FiPackage,
    FiShoppingCart,
    FiDollarSign,
    FiClock
} from "react-icons/fi";

export const RecentActivities: React.FC = () => {
    const activities = [
        {
            id: 1,
            type: "order",
            user: "Nguyễn Văn A",
            action: "đã mua",
            target: "VinFast VF8",
            amount: 1200000000,
            time: "2 phút trước",
            icon: FiShoppingCart,
            color: "emerald"
        },
        {
            id: 2,
            type: "product",
            user: "Trần Thị B",
            action: "đã đăng",
            target: "Pin Lithium 60V",
            time: "5 phút trước",
            icon: FiPackage,
            color: "blue"
        },
        {
            id: 3,
            type: "user",
            user: "Lê Văn C",
            action: "đã đăng ký",
            target: "tài khoản mới",
            time: "10 phút trước",
            icon: FiUser,
            color: "purple"
        },
        {
            id: 4,
            type: "payment",
            user: "Phạm Thị D",
            action: "đã thanh toán",
            target: "đơn hàng #1234",
            amount: 85000000,
            time: "15 phút trước",
            icon: FiDollarSign,
            color: "amber"
        },
        {
            id: 5,
            type: "product",
            user: "Hoàng Văn E",
            action: "đã cập nhật",
            target: "Honda PCX Electric",
            time: "20 phút trước",
            icon: FiPackage,
            color: "rose"
        }
    ];

    const getColorClasses = (color: string) => {
        const colors = {
            emerald: "bg-emerald-100 text-emerald-600",
            blue: "bg-blue-100 text-blue-600",
            purple: "bg-purple-100 text-purple-600",
            amber: "bg-amber-100 text-amber-600",
            rose: "bg-rose-100 text-rose-600"
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    return (
        <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                        <FiActivity className="w-3 h-3 text-white" />
                    </div>
                    Hoạt động gần đây
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {activities.map((activity) => {
                    const Icon = activity.icon;
                    return (
                        <div key={activity.id} className="flex items-start gap-3 group">
                            <div className={`w-8 h-8 rounded-lg ${getColorClasses(activity.color)} flex items-center justify-center flex-shrink-0`}>
                                <Icon className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-gray-900">
                                            <span className="font-medium">{activity.user}</span>
                                            <span className="text-gray-600"> {activity.action} </span>
                                            <span className="font-medium">{activity.target}</span>
                                        </p>

                                        {activity.amount && (
                                            <p className="text-xs text-emerald-600 font-semibold mt-1">
                                                {new Intl.NumberFormat('vi-VN').format(activity.amount)} VNĐ
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                                        <FiClock className="w-3 h-3" />
                                        {activity.time}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className="pt-3 border-t">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Xem tất cả hoạt động →
                    </button>
                </div>
            </CardContent>
        </Card>
    );
};