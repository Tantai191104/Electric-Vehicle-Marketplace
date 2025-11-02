import { Card } from "@/components/ui/card";
import { FaCarSide } from "react-icons/fa";
import { LucideBatteryCharging } from "lucide-react";

const categories = [
  { key: "car", label: "Ô tô điện", icon: <FaCarSide size={32} /> },
  { key: "charger", label: "Pin", icon: <LucideBatteryCharging size={32} /> },
];

interface EVCategoryCardsProps {
  selected: string;
  onSelect: (key: string) => void;
}

export default function EVCategoryCards({ selected, onSelect }: EVCategoryCardsProps) {
  return (
    <div className="flex justify-center gap-4 py-8">
      {categories.map((cat) => (
        <Card
          key={cat.key}
          onClick={() => onSelect(cat.key)}
          className={`flex flex-col items-center justify-center w-32 h-32 cursor-pointer border transition-all rounded-2xl
            ${selected === cat.key
              ? "bg-yellow-400 text-white border-yellow-500 shadow-lg scale-105"
              : "bg-white text-yellow-900 hover:bg-yellow-100 hover:shadow-md border-gray-200"
            }`}
        >
          <div className="mb-3">{cat.icon}</div>
          <span className="font-semibold text-base">{cat.label}</span>
        </Card>
      ))}
    </div>
  );
}
