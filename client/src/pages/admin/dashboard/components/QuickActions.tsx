import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FiUsers,
    FiPackage,
    FiSettings,
    FiAlertCircle,
    FiTrendingUp,
} from "react-icons/fi";

export const QuickActions: React.FC = () => {
    const actions = [
        {
            title: "Quản lý người dùng",
            description: "Xem danh sách người dùng",
            icon: FiUsers,
            color: "purple",
            bgColor: "bg-purple-50",
            textColor: "text-purple-600",
            action: () => console.log("Manage users")
        },
        {
            title: "Duyệt sản phẩm",
            description: "47 sản phẩm chờ duyệt",
            icon: FiPackage,
            color: "amber",
            bgColor: "bg-amber-50",
            textColor: "text-amber-600",
            badge: 47,
            action: () => console.log("Review products")
        },
        {
            title: "Cài đặt hệ thống",
            description: "Cấu hình và setting",
            icon: FiSettings,
            color: "gray",
            bgColor: "bg-gray-50",
            textColor: "text-gray-600",
            action: () => console.log("Settings")
        }
    ];

    const notifications = [
        {
            type: "warning",
            message: "47 sản phẩm chờ duyệt",
            action: "Xem ngay"
        },
        {
            type: "success",
            message: "128 đơn hàng hoàn thành hôm nay",
            action: "Chi tiết"
        },
        {
            type: "info",
            message: "Báo cáo tháng đã sẵn sàng",
            action: "Tải về"
        }
    ];

    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                            <FiTrendingUp className="w-3 h-3 text-white" />
                        </div>
                        Thao tác nhanh
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {actions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Button
                                key={index}
                                variant="ghost"
                                className="w-full justify-start h-auto p-4 hover:bg-gray-50"
                                onClick={action.action}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center`}>
                                        <Icon className={`w-5 h-5 ${action.textColor}`} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900">{action.title}</p>
                                            {action.badge && (
                                                <Badge className="bg-red-100 text-red-700 text-xs">
                                                    {action.badge}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">{action.description}</p>
                                    </div>
                                </div>
                            </Button>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
                            <FiAlertCircle className="w-3 h-3 text-white" />
                        </div>
                        Thông báo
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {notifications.map((notification, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className={`w-2 h-2 rounded-full mt-2 ${notification.type === 'warning' ? 'bg-amber-500' :
                                notification.type === 'success' ? 'bg-emerald-500' :
                                    'bg-blue-500'
                                }`} />
                            <div className="flex-1">
                                <p className="text-sm text-gray-900">{notification.message}</p>
                                <Button variant="link" className="h-auto p-0 text-xs text-blue-600">
                                    {notification.action}
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};