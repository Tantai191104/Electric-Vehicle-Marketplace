import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiTrendingUp, FiDollarSign } from "react-icons/fi";

interface Props {
  timeRange: string;
}

export const RevenueChart: React.FC<Props> = ({ timeRange }) => {
  const chartData = [
    { date: "1/11", revenue: 125000000, orders: 45 },
    { date: "2/11", revenue: 185000000, orders: 67 },
    { date: "3/11", revenue: 155000000, orders: 52 },
    { date: "4/11", revenue: 210000000, orders: 78 },
    { date: "5/11", revenue: 175000000, orders: 63 },
    { date: "6/11", revenue: 245000000, orders: 89 },
    { date: "7/11", revenue: 195000000, orders: 71 }
  ];

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);

  return (
    <Card className="border border-gray-200 shadow-lg bg-white">
      <CardHeader className="pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-gray-900">
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center shadow-md">
                <FiDollarSign className="w-4 h-4 text-white" />
              </div>
              Doanh thu theo thời gian
            </CardTitle>
            <p className="text-gray-600 text-sm mt-1">
              Biểu đồ doanh thu và đơn hàng
            </p>
          </div>
          <Badge className="gap-1 bg-gray-900 text-white border-gray-900 shadow-sm">
            <FiTrendingUp className="w-3 h-3" />
            +12.5%
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 font-medium">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('vi-VN').format(totalRevenue)} VNĐ
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 font-medium">Tổng đơn hàng</p>
            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          </div>
        </div>

        <div className="space-y-3">
          {chartData.map((item, index) => {
            const maxRevenue = Math.max(...chartData.map(d => d.revenue));
            const width = (item.revenue / maxRevenue) * 100;
            
            return (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 text-xs text-gray-600 font-medium">
                  {item.date}
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gray-900 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3 shadow-sm"
                    style={{ width: `${width}%` }}
                  >
                    <span className="text-xs text-white font-semibold">
                      {new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(item.revenue)}
                    </span>
                  </div>
                </div>
                <div className="w-16 text-xs text-gray-600 text-right">
                  {item.orders} đơn
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};