import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const locations = ["Tất cả", "Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ"];

interface LocationDropdownProps {
  value?: string;
  onChange?: (value: string) => void;
}

const LocationDropdown: React.FC<LocationDropdownProps> = ({ value = "Tất cả", onChange }) => (
  <DropdownMenu modal={false}>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        className="px-3 py-2 rounded border border-yellow-400 text-black font-bold bg-yellow-200 flex items-center gap-2 flex-shrink-0"
      >
        {value || "Tất cả"}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="inline align-middle"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-40 bg-white shadow-lg border border-gray-300 rounded-md ">
      {locations.map((loc) => (
        <DropdownMenuItem key={loc} onClick={() => onChange?.(loc === "Tất cả" ? "" : loc)}>
          {loc}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

export default LocationDropdown;
