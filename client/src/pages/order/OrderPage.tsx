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
import { useMemo } from "react";
import { userServices } from "@/services/userServices";


const OrderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 5;
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

  // Tách đơn GHN và đơn đặt cọc
  const ghnOrders = useMemo(() => orders.filter(o => o.shipping?.method === "GHN"), [orders]);

  // Đơn đặt cọc: chỉ lấy đơn deposit mà mình là người mua
  const depositOrders = useMemo(() => {
    if (!user?._id) return [];
    return orders.filter(order => {
      const isDepositOrder = order.shipping?.method !== "GHN";
      const buyerId = typeof order.buyerId === 'string' ? order.buyerId : order.buyerId?._id;
      const isBuyer = buyerId === user._id;
      return isDepositOrder && isBuyer;
    });
  }, [orders, user]);

  // Lọc đơn bán (đơn deposit mà mình là người bán)
  const sellerOrders = useMemo(() => {
    if (!user?._id) return [];
    return orders.filter(order => {
      // Chỉ lấy đơn deposit (không phải GHN)
      const isDepositOrder = order.shipping?.method !== "GHN";
      // Kiểm tra mình có phải là người bán không
      const sellerId = typeof order.sellerId === 'string' ? order.sellerId : order.sellerId?._id;
      const isSeller = sellerId === user._id;

      return isDepositOrder && isSeller;
    });
  }, [orders, user]);  // Tabs: all, ghn, deposit, seller-deposits, status
  const tabOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    if (activeTab === "ghn") return ghnOrders;
    if (activeTab === "deposit") return depositOrders;
    if (activeTab === "seller-deposits") return sellerOrders;
    return orders.filter((order: Order) => order.status === activeTab);
  }, [activeTab, orders, ghnOrders, depositOrders, sellerOrders]);

  // Pagination
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return tabOrders.slice(start, start + pageSize);
  }, [tabOrders, page, pageSize]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto pt-32 px-4 md:px-6 lg:px-8">
        <OrderHeader />

        {/* OrderTabs component for tab navigation */}
        <OrderTabs
          activeTab={activeTab}
          onTabChange={tab => { setActiveTab(tab); setPage(1); }}
          ordersCount={orders.length}
          ghnCount={ghnOrders.length}
          depositCount={depositOrders.length}
          sellerDepositCount={sellerOrders.length}
        >
          {paginatedOrders.length === 0 ? (
            <EmptyState activeTab={activeTab} navigate={navigate} />
          ) : (
            <>
              <div className="space-y-6">
                {paginatedOrders.map((order: Order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    navigate={navigate}
                  />
                ))}
              </div>
              {/* Modern Pagination */}
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  aria-label="Trang trước"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-50 rounded">
                  Trang <span className="font-bold text-black">{page}</span> / <span className="text-gray-500">{Math.max(1, Math.ceil(tabOrders.length / pageSize))}</span>
                </span>
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition"
                  disabled={page >= Math.ceil(tabOrders.length / pageSize)}
                  onClick={() => setPage(page + 1)}
                  aria-label="Trang sau"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </>
          )}
        </OrderTabs>
      </div>
    </div>
  );
};



export default OrderPage;
