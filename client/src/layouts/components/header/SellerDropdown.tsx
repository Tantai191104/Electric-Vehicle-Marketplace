
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

const SellerDropdown = () => (
  <DropdownMenu modal={false}>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className="bg-white text-yellow-900 font-medium text-sm px-3 py-1 rounded-full shadow-sm hover:bg-yellow-100 transition flex-shrink-0 "
      >
        Dành cho người bán
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="inline ml-1 align-middle"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      className="w-48 bg-white shadow-lg border border-gray-300 rounded-md relative"
    >
      <Link to="own/product">
        <DropdownMenuItem>Quản lý tin</DropdownMenuItem>
      </Link>
      <Link to="subscriptions">
        <DropdownMenuItem>Gói Pro</DropdownMenuItem>
      </Link>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default SellerDropdown;
