import React from "react";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FaTag, FaCheckCircle, FaShoppingCart } from "react-icons/fa";

type Activity = {
  title: string;
  time: string;
  type: "ban" | "daBan" | "daMua";
};

type RecentActivityCardProps = {
  activities: Activity[];
};

const typeMap = {
  ban: {
    label: "Đăng bán",
    icon: <FaTag className="text-yellow-600 w-5 h-5 mr-2" />,
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    badgeBg: "bg-yellow-100",
  },
  daBan: {
    label: "Đã bán",
    icon: <FaCheckCircle className="text-green-600 w-5 h-5 mr-2" />,
    bg: "bg-green-50",
    text: "text-green-800",
    badgeBg: "bg-green-100",
  },
  daMua: {
    label: "Đã mua",
    icon: <FaShoppingCart className="text-blue-600 w-5 h-5 mr-2" />,
    bg: "bg-blue-50",
    text: "text-blue-800",
    badgeBg: "bg-blue-100",
  },
};

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ activities }) => (
  <Card className="shadow-xl rounded-2xl bg-white min-h-[540px]">
    <CardHeader className="pb-0">
      <CardDescription className="text-gray-500 mt-1">
        Hoạt động đăng bán & giao dịch
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Tabs defaultValue="ban" className="w-full">
        <TabsList className="mb-4 bg-gray-100 rounded-lg p-1 flex justify-around">
          <TabsTrigger value="ban" className="flex-1 text-center py-2 rounded-lg hover:bg-yellow-100 data-[state=active]:bg-yellow-200 data-[state=active]:font-semibold">
            <FaTag className="mx-auto text-yellow-700 mb-1 w-6 h-6" />
            Đăng bán
          </TabsTrigger>
          <TabsTrigger value="daBan" className="flex-1 text-center py-2 rounded-lg hover:bg-green-100 data-[state=active]:bg-green-200 data-[state=active]:font-semibold">
            <FaCheckCircle className="mx-auto text-green-600 mb-1 w-6 h-6" />
            Đã bán
          </TabsTrigger>
          <TabsTrigger value="daMua" className="flex-1 text-center py-2 rounded-lg hover:bg-blue-100 data-[state=active]:bg-blue-200 data-[state=active]:font-semibold">
            <FaShoppingCart className="mx-auto text-blue-600 mb-1 w-6 h-6" />
            Đã mua
          </TabsTrigger>
        </TabsList>

        {["ban", "daBan", "daMua"].map((type) => (
          <TabsContent value={type} key={type}>
            <div className="flex flex-col gap-3">
              {activities.filter(a => a.type === type).length === 0 ? (
                <div className="text-gray-400 text-center py-6 italic">Không có mục nào.</div>
              ) : (
                activities
                  .filter(a => a.type === type)
                  .map((activity, idx) => {
                    const t = typeMap[type as keyof typeof typeMap];
                    return (
                      <div
                        key={idx}
                        className={`flex justify-between items-center p-3 rounded-xl hover:shadow-md transition ${t.bg}`}
                      >
                        <div className="flex items-center gap-2">
                          {t.icon}
                          <span className={`font-medium ${t.text}`}>{activity.title}</span>
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${t.badgeBg} ${t.text}`}>{t.label}</span>
                        </div>
                        <span className="text-gray-400 text-xs">{activity.time}</span>
                      </div>
                    );
                  })
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </CardContent>
  </Card>
);

export default RecentActivityCard;
