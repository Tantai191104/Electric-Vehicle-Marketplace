import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaRegCircleCheck, FaRegCircle } from "react-icons/fa6";

const categories = [
  { label: "Ô tô điện", value: "vehicle" },
  { label: "Pin", value: "battery" },
];

const CategoryDropdown = ({
  selected,
  setSelected,
}: {
  selected: string;
  setSelected: (cat: string) => void;
}) => {
  const selectedLabel = categories.find(cat => cat.value === selected)?.label || "Danh mục";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="px-3 py-2 rounded border border-yellow-400 text-black font-bold bg-yellow-200 flex items-center gap-2 flex-shrink-0"
        >
          {selectedLabel}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polyline
              points="6 9 12 15 18 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="inline align-middle"
            ></polyline>
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-white shadow-lg border border-gray-300 rounded-md relative">
        {categories.map((cat) => (
          <DropdownMenuItem
            key={cat.label}
            onClick={() => setSelected(cat.value)}
            className="flex items-center gap-2 cursor-pointer"
          >
            {selected === cat.value ? (
              <FaRegCircleCheck className="text-yellow-600" />
            ) : (
              <FaRegCircle className="text-gray-400" />
            )}
            {cat.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CategoryDropdown;
