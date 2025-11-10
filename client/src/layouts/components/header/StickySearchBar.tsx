import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineMenu, AiOutlineHeart, AiOutlineUser, AiOutlineBell } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import SellerDropdown from "./SellerDropdown";


const StickySearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-yellow-300 to-yellow-400 z-50">
      <div className="flex items-center gap-2 px-2 md:px-6 py-4">
        {/* Logo + Seller */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <Button variant="ghost" size="icon" className="text-yellow-900 h-10 w-10">
            <AiOutlineMenu size={24} />
          </Button>
          <div className="flex items-center bg-white rounded-full px-2 py-1 md:px-3 shadow min-w-0">
            <img src="/vite.svg" alt="Logo" className="w-6 h-6 md:w-7 md:h-7 rounded-full mr-1" />
            <span className="font-bold text-sm md:text-base text-yellow-900 truncate">EV Marketplace</span>
          </div>
          <SellerDropdown />
        </div>
        {/* Search bar chiếm giữa */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 bg-white rounded-full shadow px-3 py-2">
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-2 md:px-3 py-1 text-sm md:text-base focus:outline-none"
          />
          <button
            type="submit"
            className="px-3 py-1 rounded-lg bg-yellow-300 text-black font-bold hover:bg-yellow-600 text-xs md:text-sm"
          >
            Tìm kiếm
          </button>
        </form>
        {/* Action buttons */}
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-yellow-900 h-10 w-10"
            onClick={() => navigate("/wishlist")}
          >
            <AiOutlineHeart size={22} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-yellow-900 h-10 w-10"
            onClick={() => navigate("/profile")}
          >
            <AiOutlineUser size={22} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-yellow-900 h-10 w-10"
            onClick={() => navigate("/notifications")}
          >
            <AiOutlineBell size={22} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StickySearchBar;