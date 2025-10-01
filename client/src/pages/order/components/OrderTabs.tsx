import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrderTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  ordersCount: number;
  children: React.ReactNode;
}

export const OrderTabs: React.FC<OrderTabsProps> = ({ 
  activeTab, 
  onTabChange, 
  ordersCount, 
  children 
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mb-8">
      <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full bg-white shadow-sm border border-gray-200 rounded-xl p-1">
        <TabsTrigger 
          value="all" 
          className="data-[state=active]:bg-gray-800 data-[state=active]:text-white font-semibold transition-all duration-200"
        >
          Tất cả ({ordersCount})
        </TabsTrigger>
        <TabsTrigger 
          value="pending" 
          className="data-[state=active]:bg-gray-600 data-[state=active]:text-white font-semibold transition-all duration-200"
        >
          Chờ xử lý
        </TabsTrigger>
        <TabsTrigger 
          value="processing" 
          className="data-[state=active]:bg-gray-700 data-[state=active]:text-white font-semibold transition-all duration-200"
        >
          Đang xử lý
        </TabsTrigger>
        <TabsTrigger 
          value="shipping" 
          className="data-[state=active]:bg-gray-800 data-[state=active]:text-white font-semibold transition-all duration-200"
        >
          Đang giao
        </TabsTrigger>
        <TabsTrigger 
          value="delivered" 
          className="data-[state=active]:bg-black data-[state=active]:text-white font-semibold transition-all duration-200"
        >
          Đã giao
        </TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className="mt-6">
        {children}
      </TabsContent>
    </Tabs>
  );
};