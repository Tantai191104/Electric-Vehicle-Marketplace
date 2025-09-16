// components/RecentActivityCard.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Activity = {
  title: string;
  time: string;
};

type RecentActivityCardProps = {
  activities: Activity[];
};

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ activities }) => (
  <Card className="shadow-md rounded-xl bg-white">
    <CardHeader>
      <CardTitle>Hoạt động gần đây</CardTitle>
      <CardDescription>Các đơn hàng và bài đăng gần đây</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-3 mt-2">
      {activities.map((activity, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition"
        >
          <span className="text-yellow-900 font-medium">{activity.title}</span>
          <span className="text-yellow-600 text-sm">{activity.time}</span>
        </div>
      ))}
    </CardContent>
  </Card>
);

export default RecentActivityCard;
