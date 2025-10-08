import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  OrderCard,
  EmptyState,
  LoadingState,
  OrderHeader,
  OrderTabs,
  type Order
} from "@/pages/order/components";
import { userServices } from "@/services/userServices";


const OrderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await userServices.fetchOrders();
        console.log('Fetched orders response:', response);
        const orderList = Array.isArray(response.orders) ? response.orders : [];
        setOrders(orderList);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Không thể tải danh sách đơn hàng');
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const filteredOrders = orders.filter((order: Order) => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto pt-32 px-4 md:px-6 lg:px-8">
        <OrderHeader />

        <OrderTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          ordersCount={orders.length}
        >
          {filteredOrders.length === 0 ? (
            <EmptyState activeTab={activeTab} navigate={navigate} />
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order: Order) => (
                <OrderCard key={order._id} order={order} navigate={navigate} />
              ))}
            </div>
          )}
        </OrderTabs>
      </div>
    </div>
  );
};



export default OrderPage;
