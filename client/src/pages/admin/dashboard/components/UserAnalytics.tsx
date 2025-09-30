import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiUsers, FiTrendingUp, FiUserPlus, FiUserCheck, FiActivity } from "react-icons/fi";

interface Props {
  timeRange: string;
}

export const UserAnalytics: React.FC<Props> = () => {
  // Mock data - thay thế bằng real data từ API
  const userStats = {
    total: 12847,
    newUsers: 3126,
    activeUsers: 8934,
    growth: 15.2
  };

  const weeklyData = [
    { day: "T2", newUsers: 45, activeUsers: 1240 },
    { day: "T3", newUsers: 67, activeUsers: 1456 },
    { day: "T4", newUsers: 52, activeUsers: 1389 },
    { day: "T5", newUsers: 78, activeUsers: 1567 },
    { day: "T6", newUsers: 89, activeUsers: 1723 },
    { day: "T7", newUsers: 124, activeUsers: 1892 },
    { day: "CN", newUsers: 156, activeUsers: 2134 }
  ];

  const userTypes = [
    { 
      type: "Người mua", 
      count: 8934, 
      percentage: 69.5, 
      icon: FiUsers,
      color: "blue",
      description: "Khách hàng mua sắm"
    },
    { 
      type: "Người bán", 
      count: 2456, 
      percentage: 19.1, 
      icon: FiUserCheck,
      color: "emerald",
      description: "Đối tác bán hàng"
    },
    { 
      type: "Người dùng mới", 
      count: 1457, 
      percentage: 11.3, 
      icon: FiUserPlus,
      color: "purple",
      description: "Đăng ký trong tháng"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-100", gradient: "from-blue-500 to-cyan-600" },
      emerald: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-100", gradient: "from-emerald-500 to-green-600" },
      purple: { bg: "bg-purple-500", text: "text-purple-600", light: "bg-purple-100", gradient: "from-purple-500 to-violet-600" }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const maxActive = Math.max(...weeklyData.map(d => d.activeUsers));

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 flex items-center justify-center">
                <FiUsers className="w-4 h-4 text-white" />
              </div>
              Phân tích người dùng
            </CardTitle>
            <p className="text-gray-600 text-sm mt-1">
              Thống kê hoạt động và tăng trưởng
            </p>
          </div>
          <Badge className="gap-1 bg-purple-100 text-purple-700 border-purple-200">
            <FiTrendingUp className="w-3 h-3" />
            +{userStats.growth}%
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100">
            <p className="text-sm text-purple-600 font-medium">Tổng người dùng</p>
            <p className="text-2xl font-bold text-purple-700">
              {new Intl.NumberFormat('vi-VN').format(userStats.total)}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
            <p className="text-sm text-emerald-600 font-medium">Hoạt động</p>
            <p className="text-2xl font-bold text-emerald-700">
              {new Intl.NumberFormat('vi-VN').format(userStats.activeUsers)}
            </p>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FiActivity className="w-4 h-4" />
            Hoạt động trong tuần
          </h4>
          <div className="space-y-3">
            {weeklyData.map((day, index) => {
              const activeWidth = (day.activeUsers / maxActive) * 100;
              const newWidth = (day.newUsers / 200) * 100; // Scale for visibility
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="w-8 font-medium text-gray-600">{day.day}</span>
                    <div className="flex gap-4 text-gray-600">
                      <span>Hoạt động: {day.activeUsers}</span>
                      <span>Mới: {day.newUsers}</span>
                    </div>
                  </div>
                  
                  {/* Active Users Bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-full h-3 relative overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${activeWidth}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* New Users Bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-full h-2 relative overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${newWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Types */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Phân loại người dùng</h4>
          <div className="space-y-3">
            {userTypes.map((userType, index) => {
              const Icon = userType.icon;
              const colors = getColorClasses(userType.color);
              return (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 rounded-lg ${colors.light} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900">{userType.type}</p>
                      <span className="text-sm font-bold text-gray-900">{userType.count}</span>
                    </div>
                    <p className="text-xs text-gray-600">{userType.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${userType.percentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">{userType.percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <p className="text-xs text-blue-600 font-medium">Người dùng mới/ngày</p>
            <p className="text-lg font-bold text-blue-700">
              {Math.round(userStats.newUsers / 7)}
            </p>
          </div>
          <div className="text-center p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
            <p className="text-xs text-emerald-600 font-medium">Tỷ lệ hoạt động</p>
            <p className="text-lg font-bold text-emerald-700">
              {((userStats.activeUsers / userStats.total) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};