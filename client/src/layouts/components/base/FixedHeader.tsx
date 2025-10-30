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
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { authServices } from "@/services/authServices";

const FixedHeader: React.FC = () => {
  const categories = [
    { name: "Xe điện", path: "/cars" },
    { name: "Xe máy điện", path: "/motorbikes" },
    { name: "Pin xe điện", path: "/batteries" },
  ];
  const topLinks = [
    { name: "Trang chủ", path: "/" },
    { name: "Xe điện", path: "/cars" },
    { name: "Xe máy điện", path: "/motorbikes" },
    { name: "Pin xe điện", path: "/batteries" }
  ];
  const rightTopLinks = [
    { name: "Đóng góp ý kiến", path: "/feedback" },
    { name: "Tải ứng dụng", path: "/download" },
    { name: "Trợ giúp", path: "/help" }
  ];
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const handleLogout = () => {
    clearAuth();
    authServices.logout();
    navigate("/");
  };
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-yellow-300 to-yellow-400 backdrop-blur-md shadow-lg border-b border-yellow-400 px-2 md:px-6">
      {/* Top nav */}
      <div className="flex justify-between items-center px-2 md:px-6 py-2 text-sm text-black font-semibold">
        <div className="flex gap-4 md:gap-6">
          {topLinks.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className="hover:underline hover:text-yellow-800 transition-colors bg-transparent border-none cursor-pointer"
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="flex gap-4 md:gap-6 items-center">
          {rightTopLinks.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className="hover:underline hover:text-yellow-800 transition-colors bg-transparent border-none cursor-pointer"
            >
              {item.name}
            </button>
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
              {!user ? (
                <DropdownMenuItem 
                  className="text-black font-semibold"
                  onClick={() => navigate("/auth/login")}
                >
                  Đăng nhập bán hàng
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem 
                    className="text-black font-semibold"
                    onClick={() => navigate("/articles/new")}
                  >
                    Đăng tin mới
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-black font-semibold">
                    Quản lý tin đăng
                  </DropdownMenuItem>
                </>
              )}
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
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 md:gap-3 bg-transparent border-none cursor-pointer"
          >
            <img
              src="/vite.svg"
              alt="EV Marketplace Logo"
              className="w-8 h-8 md:w-10 md:h-10 rounded-full shadow-lg"
            />
            <span className="font-extrabold text-lg md:text-2xl text-black tracking-wide drop-shadow">
              EV Market
            </span>
          </button>

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
                    key={cat.name}
                    className="text-black font-semibold"
                    onClick={() => navigate(cat.path)}
                  >
                    {cat.name}
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
          {user && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-yellow-100 text-black flex-shrink-0"
                title="Thông báo"
              >
                <AiOutlineBell size={22} />
              </Button>
              <Button
                onClick={() => navigate("/chat")}
                variant="ghost"
                size="icon"
                className="hover:bg-yellow-100 text-black flex-shrink-0"
                title="Tin nhắn"
              >
                <AiOutlineMessage size={22} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-yellow-100 text-black flex-shrink-0"
                title="Giỏ hàng"
              >
                <AiOutlineShopping size={22} />
              </Button>
              <Separator orientation="vertical" className="h-6 border-yellow-400" />
            </>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                  <Avatar className="w-8 h-8 border-yellow-400">
                    <AvatarImage src={user.avatar || "/avatar.png"} alt={user.name} />
                    <AvatarFallback className="bg-yellow-600 text-white font-bold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-black hidden md:inline">
                    {user.name || 'User'}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <Portal>
                <DropdownMenuContent
                  align="end"
                  sideOffset={4}
                  className="w-48 bg-white shadow-lg border border-yellow-400 rounded-md z-50"
                >
                  <DropdownMenuItem 
                    className="text-black font-semibold"
                    onClick={() => navigate("/profile")}
                  >
                    Tài khoản của tôi
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-black font-semibold"
                    onClick={() => navigate("/wishlist")}
                  >
                    Danh sách yêu thích
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-black font-semibold">
                    Cài đặt
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-black font-semibold"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </Portal>
            </DropdownMenu>
          ) : (
            <Button 
              variant="outline"
              onClick={() => navigate("/auth/login")}
              className="bg-white border-yellow-400 text-black hover:bg-yellow-100 font-semibold flex-shrink-0"
            >
              Đăng nhập
            </Button>
          )}

          {user && (
            <Button
              onClick={() => navigate("/articles/create")}
              className="bg-black hover:bg-gray-800 text-white font-extrabold px-4 py-2 rounded-full shadow flex-shrink-0"
            >
              ĐĂNG TIN
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default FixedHeader;
