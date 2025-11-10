import React, { useState, useEffect } from "react";
import {
  AiOutlineMenu,
  AiOutlineBell,
  AiOutlinePlusCircle,
  AiOutlineMessage,
} from "react-icons/ai";
import { FiHeart } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SellerDropdown from "../header/SellerDropdown";
import UserDropdown from "../header/UserDropdown";
import CategoryDropdown from "../header/CategoryDropdown";
import LocationDropdown from "../header/LocationDropdown";
import StickySearchBar from "../header/StickySearchBar";
import { IoCartOutline } from "react-icons/io5";
import { useAuthStore } from "@/store/auth";

// Navigation: scroll to product or battery sections on home
const navLinks = [
  { label: "Ô tô", target: "cars" },
  { label: "Pin", target: "batteries" },
];

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [showStickySearch, setShowStickySearch] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setShowStickySearch(window.scrollY > 140);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (location) params.append("location", location);

    // Always navigate to homepage with category param for filtering
    if (selected === "vehicle") {
      params.append("category", "vehicle");
      navigate(`/?${params.toString()}`);
    } else if (selected === "battery") {
      params.append("category", "battery");
      navigate(`/?${params.toString()}`);
    } else {
      // If no category selected, don't add category param (show all on homepage)
      navigate(`/?${params.toString()}`);
    }
  };

  return (
    <header className="w-full bg-gradient-to-r from-yellow-300 to-yellow-400 py-2 px-2 md:py-4 md:px-6 flex flex-col gap-2 md:gap-4 shadow-lg mb-4 relative z-50 ">
      {/* Main header row */}
      <div className="flex items-center justify-between w-full flex-wrap gap-y-2">
        {/* Logo + Seller */}
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
              EV Marketplace
            </span>
          </div>
          <SellerDropdown />
        </div>
        {/* Nav center */}
        {!showStickySearch && (
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={`#${item.target}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-yellow-900 font-semibold text-sm tracking-wide px-3 py-1 rounded-lg hover:bg-white/30 hover:text-yellow-800 transition"
              >
                {item.label}
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
            <IoCartOutline size={32} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-yellow-900 h-12 w-12"
            onClick={() => navigate("/wishlist")}
            aria-label="Wishlist"
          >
            <FiHeart size={30} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-yellow-900 h-12 w-12"
            onClick={() => navigate("/chat")}
          >
            <AiOutlineMessage size={32} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-yellow-900 h-12 w-12"
          >
            <AiOutlineBell size={32} />
          </Button>
          {!isAuthenticated && (

            <Button
              onClick={() => navigate("/auth/login")}
              variant="outline"
              className="text-yellow-900 font-semibold bg-white hover:bg-yellow-100 px-4 py-2 rounded-lg"
            >
              Đăng nhập
            </Button>
          )}
          <Button
            variant="default"
            className="bg-yellow-300 text-black font-bold hover:bg-yellow-500 flex items-center gap-1 px-2 py-1 md:px-4 md:py-2 rounded-lg text-sm md:text-base"
            onClick={() => navigate("/articles/create")}
          >
            <AiOutlinePlusCircle size={20} className="md:mr-1" />
            <span className="hidden sm:inline">Đăng tin</span>
          </Button>
          <UserDropdown />
        </div>
      </div>

      {/* Search form */}
      <div className="relative w-full flex flex-col items-center min-h-[120px] md:min-h-[160px]">
        <h2 className="text-xl md:text-3xl font-bold text-yellow-900 mb-2 w-full text-center px-2">
          Nền tảng mua bán xe điện cũ uy tín, nhanh chóng
        </h2>
        <div className="absolute left-1/2 -translate-x-1/2 top-24 md:top-28 w-full max-w-lg md:max-w-2xl lg:max-w-4xl z-10">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2 w-full bg-white rounded-xl shadow-lg px-2 py-4 md:px-4 md:py-6">
            <CategoryDropdown selected={selected} setSelected={setSelected} />
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:flex-1 px-3 py-2 md:px-4 md:py-2 rounded border border-yellow-400 focus:outline-none text-sm md:text-base"
            />
            <LocationDropdown value={location} onChange={setLocation} />
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
      {showStickySearch && <StickySearchBar />}
    </header>
  );
};

export default Header;
