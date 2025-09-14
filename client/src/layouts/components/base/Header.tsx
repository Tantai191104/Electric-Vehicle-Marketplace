import React, { useState, useEffect } from "react";
import {
  AiOutlineMenu,
  AiOutlineHeart,
  AiOutlineUser,
  AiOutlineBell,
  AiOutlinePlusCircle,
} from "react-icons/ai";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaRegCircleCheck, FaRegCircle } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>("");
  const [showStickySearch, setShowStickySearch] = useState(false);

  const categories = ["Xe máy điện", "Ô tô điện", "Phụ kiện"];
  useEffect(() => {
    const handleScroll = () => {
      setShowStickySearch(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header className="w-full bg-gradient-to-r from-yellow-300 to-yellow-400 py-2 px-2 md:py-4 md:px-6 flex flex-col gap-2 md:gap-4 shadow-lg">
      <div className="flex items-center justify-between w-full flex-wrap gap-y-2">
        {/* Logo + Seller Badge */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-yellow-900 h-12 w-12"
          >
            <AiOutlineMenu size={28} />
          </Button>

          <div className="flex items-center bg-white rounded-full px-2 py-1 md:px-4 shadow min-w-0">
            <img
              src="/vite.svg"
              alt="Logo"
              className="w-7 h-7 md:w-8 md:h-8 rounded-full mr-1 md:mr-2"
            />
            <span className="font-bold text-base md:text-lg text-yellow-900 tracking-wide truncate">
              chợTỐT
            </span>
          </div>

          {/* Seller dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="bg-white text-yellow-900 font-medium text-sm px-3 py-1 rounded-full shadow-sm hover:bg-yellow-100 transition"
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
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem>Quản lý tin</DropdownMenuItem>
              <DropdownMenuItem>Gói Pro</DropdownMenuItem>
              <DropdownMenuItem>Dành cho đối tác</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Nav center */}
        {!showStickySearch && (
          <nav className="hidden lg:flex items-center gap-2">
            {["Chợ Tốt", "Xe cộ", "Bất động sản", "Việc làm"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-yellow-900 font-semibold text-sm tracking-wide px-3 py-1 rounded-lg hover:bg-white/30 hover:text-yellow-800 transition"
              >
                {item}
              </a>
            ))}
          </nav>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="icon"
            className="text-yellow-900 h-12 w-12"
          >
            <AiOutlineHeart size={32} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-yellow-900 h-12 w-12"
          >
            <AiOutlineUser size={32} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-yellow-900 h-12 w-12"
          >
            <AiOutlineBell size={32} />
          </Button>

          <Button
            onClick={() => navigate("/auth/login")}
            variant="outline"
            className="text-yellow-900 font-semibold bg-white hover:bg-yellow-100 px-4 py-2 rounded-lg"
          >
            Đăng nhập
          </Button>

          <Button
            variant="default"
            className="bg-yellow-300 text-black font-bold hover:bg-yellow-500 flex items-center gap-1 px-2 py-1 md:px-4 md:py-2 rounded-lg text-sm md:text-base"
          >
            <AiOutlinePlusCircle size={20} className="md:mr-1" />{" "}
            <span className="hidden sm:inline">Đăng tin</span>
          </Button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 bg-white text-yellow-900 rounded-full border border-gray-200 shadow px-3 py-1"
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
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem>Tài khoản của tôi</DropdownMenuItem>
              <DropdownMenuItem>Đăng xuất</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search form */}
      <div className="relative w-full flex flex-col items-center min-h-[120px] md:min-h-[160px]">
        <h2 className="text-xl md:text-3xl font-bold text-yellow-900 mb-2 w-full text-center px-2">
          Nền tảng mua bán xe điện cũ uy tín, nhanh chóng
        </h2>
        <div className="absolute left-1/2 -translate-x-1/2 top-24 md:top-28 w-full max-w-lg md:max-w-2xl lg:max-w-4xl z-10">
          <form className="flex flex-col sm:flex-row items-center gap-2 w-full bg-white rounded-xl shadow-lg px-2 py-4 md:px-4 md:py-6">
            {/* Dropdown danh mục */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="px-3 py-2 rounded border border-yellow-400 text-black font-bold bg-yellow-200 flex items-center gap-2"
                >
                  Danh mục
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
              <DropdownMenuContent className="w-40">
                {categories.map((cat) => (
                  <DropdownMenuItem
                    key={cat}
                    onClick={() => setSelected(cat)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {selected === cat ? (
                      <FaRegCircleCheck className="text-yellow-600" />
                    ) : (
                      <FaRegCircle className="text-gray-400" />
                    )}
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              className="w-full sm:flex-1 px-3 py-2 md:px-4 md:py-2 rounded border border-yellow-400 focus:outline-none text-sm md:text-base"
            />
            {/* Dropdown địa điểm */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="px-3 py-2 rounded border border-yellow-400 text-black font-bold bg-yellow-200 flex items-center gap-2"
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
              <DropdownMenuContent className="w-40">
                <DropdownMenuItem>Tp Hồ Chí Minh</DropdownMenuItem>
                <DropdownMenuItem>Hà Nội</DropdownMenuItem>
                <DropdownMenuItem>Đà Nẵng</DropdownMenuItem>
                <DropdownMenuItem>Cần Thơ</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-yellow-300 text-black font-bold hover:bg-yellow-600 text-sm md:text-base w-full sm:w-auto"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
        <div className="h-16 md:h-20" />
      </div>

      {/* Sticky search bar */}
      {showStickySearch && (
        <div className="fixed top-0 left-0 w-full bg-white/90 shadow z-50 flex justify-center py-2 animate-fade-in">
          <form className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-4xl bg-white rounded-xl shadow-lg px-2 py-4 md:px-4 md:py-6">
            {/* Dropdown danh mục */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="px-3 py-2 rounded border border-yellow-400 text-black font-bold bg-yellow-200 flex items-center gap-2"
                >
                  Danh mục
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
              <DropdownMenuContent className="w-40">
                {categories.map((cat) => (
                  <DropdownMenuItem
                    key={cat}
                    onClick={() => setSelected(cat)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {selected === cat ? (
                      <FaRegCircleCheck className="text-yellow-600" />
                    ) : (
                      <FaRegCircle className="text-gray-400" />
                    )}
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              className="w-full sm:flex-1 px-3 py-2 md:px-4 md:py-2 rounded border border-yellow-400 focus:outline-none text-sm md:text-base"
            />
            {/* Dropdown địa điểm */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="px-3 py-2 rounded border border-yellow-400 text-black font-bold bg-yellow-200 flex items-center gap-2"
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
              <DropdownMenuContent className="w-40">
                <DropdownMenuItem>Tp Hồ Chí Minh</DropdownMenuItem>
                <DropdownMenuItem>Hà Nội</DropdownMenuItem>
                <DropdownMenuItem>Đà Nẵng</DropdownMenuItem>
                <DropdownMenuItem>Cần Thơ</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-yellow-300 text-black font-bold hover:bg-yellow-600 text-sm md:text-base w-full sm:w-auto"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;
