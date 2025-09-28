import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumberWithDots } from "@/utils/numberFormatter";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { 
  FiPackage, 
  FiTruck, 
  FiCheckCircle, 
  FiClock, 
  FiMapPin, 
  FiUser, 
  FiPhone,
  FiMail,
  FiCreditCard,
  FiShoppingCart,
  FiCalendar,
  FiFileText
} from "react-icons/fi";
import { MdPayment, MdLocalShipping } from "react-icons/md";
import { useNavigate } from "react-router-dom";

// Mock data - trong thực tế sẽ fetch từ API
const mockOrders = [
  {
    id: "ORD001",
    status: "delivered",
    orderDate: "2024-01-15",
    deliveryDate: "2024-01-18",
    total: 150000000,
    items: [
      {
        id: "1",
        name: "VinFast VF8 Electric SUV",
        price: 150000000,
        quantity: 1,
        image: "/images/vinfast-vf8.jpg",
        category: "vehicle"
      }
    ],
    shippingAddress: {
      name: "Nguyễn Văn A",
      phone: "0123456789",
      email: "nguyenvana@email.com",
      address: "123 Nguyễn Trãi, Quận 1, TP.HCM"
    },
    paymentMethod: "credit_card",
    trackingNumber: "VN123456789"
  },
  {
    id: "ORD002", 
    status: "processing",
    orderDate: "2024-01-20",
    deliveryDate: null,
    total: 25000000,
    items: [
      {
        id: "2",
        name: "Pin Lithium 60V 20Ah",
        price: 12500000,
        quantity: 2,
        image: "/images/battery.jpg",
        category: "battery"
      }
    ],
    shippingAddress: {
      name: "Trần Thị B",
      phone: "0987654321", 
      email: "tranthib@email.com",
      address: "456 Lê Lợi, Quận 3, TP.HCM"
    },
    paymentMethod: "bank_transfer",
    trackingNumber: "VN987654321"
  }
];



const OrderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading] = useState(false);
  const navigate = useNavigate();

  const filteredOrders = mockOrders.filter(order => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto pt-32 px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AiOutlineLoading3Quarters className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Đang tải đơn hàng</h2>
            <p className="text-gray-500">Vui lòng chờ trong giây lát...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto pt-32 px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
              <FiShoppingCart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đơn hàng của tôi
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Theo dõi và quản lý tất cả đơn hàng của bạn
            </p>
          </div>
        </div>

        {/* Order Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full bg-white shadow-sm border border-gray-200 rounded-xl p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Tất cả ({mockOrders.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
              Chờ xử lý
            </TabsTrigger>
            <TabsTrigger value="processing" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Đang xử lý  
            </TabsTrigger>
            <TabsTrigger value="shipping" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              Đang giao
            </TabsTrigger>
            <TabsTrigger value="delivered" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              Đã giao
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredOrders.length === 0 ? (
              <EmptyState activeTab={activeTab} navigate={navigate} />
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Order Card Component
interface OrderCardProps {
  order: typeof mockOrders[0];
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const statusConfig = {
    pending: { label: "Chờ xử lý", variant: "secondary" as const, color: "text-yellow-600" },
    processing: { label: "Đang xử lý", variant: "default" as const, color: "text-blue-600" },
    shipping: { label: "Đang giao", variant: "default" as const, color: "text-purple-600" },
    delivered: { label: "Đã giao", variant: "default" as const, color: "text-green-600" },
    cancelled: { label: "Đã hủy", variant: "destructive" as const, color: "text-red-600" }
  };

  const status = statusConfig[order.status as keyof typeof statusConfig];

  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FiFileText className="w-5 h-5 text-gray-600" />
              <CardTitle className="text-lg font-bold text-gray-900">
                Đơn hàng #{order.id}
              </CardTitle>
            </div>
            <Badge variant={status.variant} className="flex items-center gap-1">
              {order.status === "pending" && <FiClock className="w-3 h-3" />}
              {order.status === "processing" && <FiPackage className="w-3 h-3" />}
              {order.status === "shipping" && <FiTruck className="w-3 h-3" />}
              {order.status === "delivered" && <FiCheckCircle className="w-3 h-3" />}
              {status.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <FiCalendar className="w-4 h-4" />
              <span>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</span>
            </div>
            {order.trackingNumber && (
              <div className="flex items-center gap-1">
                <MdLocalShipping className="w-4 h-4" />
                <span className="font-mono text-xs">{order.trackingNumber}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Order Items */}
        <div className="space-y-4 mb-6">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={item.image || "/images/placeholder.jpg"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span>Số lượng: {item.quantity}</span>
                  <span className="font-semibold text-gray-900">
                    {formatNumberWithDots(item.price)} VNĐ
                  </span>
                </div>
              </div>
              
              <Badge variant="outline" className="shrink-0">
                {item.category === "vehicle" ? "Xe điện" : "Pin"}
              </Badge>
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <FiMapPin className="w-4 h-4" />
              Thông tin giao hàng
            </h4>
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FiUser className="w-4 h-4 text-gray-600" />
                <span className="font-medium">{order.shippingAddress.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FiPhone className="w-4 h-4 text-gray-600" />
                <span>{order.shippingAddress.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FiMail className="w-4 h-4 text-gray-600" />
                <span>{order.shippingAddress.email}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <FiMapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                <span>{order.shippingAddress.address}</span>
              </div>
            </div>
          </div>

          {/* Payment & Total */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <MdPayment className="w-4 h-4" />
              Thanh toán
            </h4>
            <div className="bg-green-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Phương thức:</span>
                <div className="flex items-center gap-1">
                  <FiCreditCard className="w-4 h-4" />
                  <span className="font-medium">
                    {order.paymentMethod === "credit_card" ? "Thẻ tín dụng" : 
                     order.paymentMethod === "bank_transfer" ? "Chuyển khoản" : "COD"}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Tổng cộng:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatNumberWithDots(order.total)} VNĐ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
          <Button 
            variant="outline" 
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            <FiFileText className="w-4 h-4 mr-2" />
            Xem chi tiết
          </Button>
          
          {order.status === "delivered" && (
            <Button 
              variant="outline"
              className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              Đánh giá sản phẩm
            </Button>
          )}
          
          {(order.status === "pending" || order.status === "processing") && (
            <Button 
              variant="outline"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              Hủy đơn hàng
            </Button>
          )}
          
          {order.status === "shipping" && (
            <Button 
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <FiTruck className="w-4 h-4 mr-2" />
              Theo dõi đơn hàng
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Empty State Component
interface EmptyStateProps {
  activeTab: string;
  navigate: (path: string) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ activeTab, navigate }) => {
  const getEmptyMessage = () => {
    switch (activeTab) {
      case "pending": return "Không có đơn hàng nào đang chờ xử lý";
      case "processing": return "Không có đơn hàng nào đang được xử lý";
      case "shipping": return "Không có đơn hàng nào đang được giao";
      case "delivered": return "Không có đơn hàng nào đã được giao";
      default: return "Bạn chưa có đơn hàng nào";
    }
  };

  return (
    <div className="text-center py-16">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 max-w-lg mx-auto">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <FiShoppingCart className="w-12 h-12 text-gray-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          {getEmptyMessage()}
        </h2>
        
        <p className="text-gray-500 mb-8 leading-relaxed">
          {activeTab === "all" 
            ? "Khám phá những sản phẩm tuyệt vời và đặt hàng ngay hôm nay!"
            : "Hãy kiểm tra các tab khác để xem đơn hàng của bạn."
          }
        </p>
        
        {activeTab === "all" && (
          <div className="space-y-4">
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              🛒 Mua sắm ngay
            </Button>
            
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <span>•</span>
              <span>Giao hàng nhanh</span>
              <span>•</span>
              <span>Bảo hành uy tín</span>
              <span>•</span>
              <span>Hỗ trợ 24/7</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
