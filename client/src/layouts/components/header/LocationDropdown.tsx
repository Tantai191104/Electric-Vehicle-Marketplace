
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const locations = ["Tp Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ"];

const LocationDropdown = () => (
  <DropdownMenu modal={false}>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        className="px-3 py-2 rounded border border-yellow-400 text-black font-bold bg-yellow-200 flex items-center gap-2 flex-shrink-0"
      >
        Tp Hồ Chí Minh
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
        <DropdownMenuItem key={loc}>{loc}</DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

export default LocationDropdown;
