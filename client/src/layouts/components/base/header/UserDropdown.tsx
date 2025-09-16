import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AiOutlineUser } from "react-icons/ai";
import { Link } from "react-router-dom";

const UserDropdown = () => (
  <DropdownMenu modal={false}>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className="flex items-center gap-1 bg-white text-yellow-900 rounded-full border border-gray-200 shadow px-3 py-1 flex-shrink-0"
      >
        <AiOutlineUser size={24} />
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
    <DropdownMenuContent className="w-48 bg-white shadow-lg border border-gray-300 rounded-md relative">
      <DropdownMenuItem asChild>
        <Link to="/profile">Tài khoản của tôi</Link>
      </DropdownMenuItem>
      <DropdownMenuItem>Đăng xuất</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default UserDropdown;
