import React from "react";
import {
  AiOutlineMenu,
  AiOutlineBell,
  AiOutlineMessage,
  AiOutlineShopping,
} from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Portal } from "@radix-ui/react-portal";

const FixedHeader: React.FC = () => {
  const categories = ["Điện thoại", "Đồ điện tử", "Xe cộ", "Thú cưng"];
  const topLinks = ["Chợ Tốt", "Nhà Tốt", "Chợ Tốt Xe", "Việc Làm Tốt"];
  const rightTopLinks = ["Đóng góp ý kiến", "Tải ứng dụng", "Trợ giúp"];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-yellow-300 to-yellow-400 backdrop-blur-md shadow-lg border-b border-yellow-400 px-2 md:px-6">
      {/* Top nav */}
      <div className="flex justify-between items-center px-2 md:px-6 py-2 text-sm text-black font-semibold">
        <div className="flex gap-4 md:gap-6">
          {topLinks.map((item) => (
            <a
              key={item}
              href="#"
              className="hover:underline hover:text-yellow-800 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
        <div className="flex gap-4 md:gap-6 items-center">
          {rightTopLinks.map((item) => (
            <a
              key={item}
              href="#"
              className="hover:underline hover:text-yellow-800 transition-colors"
            >
              {item}
            </a>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-full border-yellow-400 text-black bg-white hover:bg-yellow-100 font-semibold flex-shrink-0">
                <AiOutlineMenu className="mr-2 h-4 w-4" />
                Dành cho người bán
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={4}
              className="w-48 bg-white shadow-lg border border-yellow-400 rounded-md z-50"
            >
              <DropdownMenuItem className="text-black font-semibold">
                Đăng nhập bán hàng
              </DropdownMenuItem>
              <DropdownMenuItem className="text-black font-semibold">
                Quản lý tin đăng
              </DropdownMenuItem>
              <DropdownMenuItem className="text-black font-semibold">
                Bảng giá dịch vụ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main header */}
      <div className="flex items-center justify-between px-2 md:px-6 py-3">
        {/* Logo & danh mục */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <img
            src="/vite.svg"
            alt="Logo"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full shadow-lg"
          />
          <span className="font-extrabold text-lg md:text-2xl text-black tracking-wide drop-shadow">
            chợTỐT
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="ml-2  font-semibold">
                <AiOutlineMenu className="mr-2 h-5 w-5" />
                Danh mục
              </Button>
            </DropdownMenuTrigger>
            <Portal>
              <DropdownMenuContent
                align="start"
                sideOffset={4}
                className="w-48 bg-white shadow-lg border border-yellow-400 rounded-md z-50"
              >
                {categories.map((cat) => (
                  <DropdownMenuItem
                    key={cat}
                    className="text-black font-semibold"
                  >
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </Portal>
          </DropdownMenu>
        </div>

        {/* Search bar */}
        <form className="flex items-center flex-1 mx-2 md:mx-6 max-w-lg md:max-w-2xl">
          <Input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="rounded-full px-4 border-yellow-400 focus:border-yellow-500 focus:ring-yellow-200 text-black font-medium placeholder:text-yellow-700"
          />
          <Button className="ml-2 rounded-full bg-yellow-300 hover:bg-yellow-500 text-black font-extrabold shadow">
            Tìm
          </Button>
        </form>

        {/* Right icons & user */}
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-yellow-100 text-black flex-shrink-0"
          >
            <AiOutlineBell size={22} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-yellow-100 text-black flex-shrink-0"
          >
            <AiOutlineMessage size={22} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-yellow-100 text-black flex-shrink-0"
          >
            <AiOutlineShopping size={22} />
          </Button>
          <Separator orientation="vertical" className="h-6 border-yellow-400" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                <Avatar className="w-8 h-8 border-yellow-400">
                  <AvatarImage src="/avatar.png" alt="Tai Tan" />
                  <AvatarFallback className="bg-yellow-600 text-white font-bold">
                    T
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-black">Tai Tan</span>
              </div>
            </DropdownMenuTrigger>
            <Portal>
              <DropdownMenuContent
                align="end"
                sideOffset={4}
                className="w-48 bg-white shadow-lg border border-yellow-400 rounded-md z-50"
              >
                <DropdownMenuItem className="text-black font-semibold">
                  Tài khoản của tôi
                </DropdownMenuItem>
                <DropdownMenuItem className="text-black font-semibold">
                  Cài đặt
                </DropdownMenuItem>
                <DropdownMenuItem className="text-black font-semibold">
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </Portal>
          </DropdownMenu>

          <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold px-4 py-2 rounded-full shadow flex-shrink-0">
            ĐĂNG TIN
          </Button>
        </div>
      </div>
    </header>
  );
};

export default FixedHeader;
