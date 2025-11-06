import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrderTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  ordersCount: number;
  ghnCount?: number;
  depositCount?: number;
  sellerDepositCount?: number;
  children: React.ReactNode;
}

export const OrderTabs: React.FC<OrderTabsProps> = ({
  activeTab,
  onTabChange,
  ordersCount,
  ghnCount = 0,
  depositCount = 0,
  sellerDepositCount = 0,
  children
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mb-8">
      <TabsList className="grid grid-cols-2 md:grid-cols-9 w-full bg-white shadow-sm border border-gray-200 rounded-xl p-1">
        <TabsTrigger
          value="all"
          className="data-[state=active]:bg-gray-800 data-[state=active]:text-white font-semibold transition-all duration-200"
        >
          Tất cả ({ordersCount})
        </TabsTrigger>
        <TabsTrigger
          value="ghn"
          className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-semibold transition-all duration-200"
        >
          Đơn GHN ({ghnCount})
        </TabsTrigger>
        <TabsTrigger
          value="deposit"
          className="data-[state=active]:bg-green-600 data-[state=active]:text-white font-semibold transition-all duration-200"
        >
          Đơn đặt cọc ({depositCount})
        </TabsTrigger>
        <TabsTrigger
          value="seller-deposits"
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold transition-all duration-200"
        >
          Đơn bán ({sellerDepositCount})
        </TabsTrigger>
        <TabsTrigger
          value="pending"
          className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white font-semibold transition-all duration-200"
        >
          Chờ xử lý
        </TabsTrigger>
        <TabsTrigger
          value="confirmed"
          className="data-[state=active]:bg-blue-500 data-[state=active]:text-white font-semibold transition-all duration-200"
        >
          Đã xác nhận
        </TabsTrigger>
        <TabsTrigger
          value="shipping"
          className="data-[state=active]:bg-yellow-700 data-[state=active]:text-white font-semibold transition-all duration-200"
        >
          Đang giao
        </TabsTrigger>
        <TabsTrigger
          value="delivered"
          className="data-[state=active]:bg-green-700 data-[state=active]:text-white font-semibold transition-all duration-200"
        >
          Đã giao
        </TabsTrigger>
        <TabsTrigger
          value="cancelled"
          className="data-[state=active]:bg-red-500 data-[state=active]:text-white font-semibold transition-all duration-200"
        >
          Đã hủy
        </TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className="mt-6">
        {children}
      </TabsContent>
    </Tabs>
  );
};