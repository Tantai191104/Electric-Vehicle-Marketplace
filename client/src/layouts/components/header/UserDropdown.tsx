
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AiOutlineUser,
  AiOutlineHeart,
  AiOutlineStar,
  AiOutlineClockCircle,
  AiOutlineSetting,
} from "react-icons/ai";
import { FaStore, FaGift, FaSearch, FaCarSide } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { authServices } from "@/services/authServices";
import ProfileAvatar from "./ProfileAvatar";
import { RiLogoutBoxLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/utils/formatVND";
import { toast } from "sonner";
const UserDropdown = () => {
  const { clearAuth, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => {
    clearAuth();
    authServices.logout();
    toast.success("Đăng xuất thành công");
    navigate("/auth/login");
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 bg-white text-yellow-900 rounded-full border border-gray-200 shadow-sm px-3 py-1"
        >
          <AiOutlineUser size={22} />
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="inline ml-1"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 bg-white shadow-xl border border-gray-200 rounded-xl p-0 
             max-h-[80vh] overflow-y-auto divide-y divide-gray-100 scroll-hidden"
        sideOffset={8}
        align="end">
        {!isAuthenticated ? (
          <>
            {/* Header khi chưa login */}
            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-yellow-100 to-yellow-50">
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-base mb-1">
                  Mua thì hời, bán thì lời.
                </div>
                <div className="text-gray-500 text-sm">Đăng nhập ngay!</div>
              </div>
              <FaCarSide className="text-yellow-600" size={28} />
            </div>

            {/* Nút đăng ký / đăng nhập */}
            <div className="flex gap-3 px-5 py-4 bg-white">
              <Link to="/auth/register" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 font-medium rounded-lg"
                >
                  Tạo tài khoản
                </Button>
              </Link>
              <Link to="/auth/login" className="flex-1">
                <Button className="w-full bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500">
                  Đăng nhập
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Header khi đã login */}
            <div className="flex flex-col items-center px-5 py-6 bg-gradient-to-r from-yellow-100 to-yellow-50">
              <ProfileAvatar user={user ? { name: user.name ?? undefined } : undefined} />
              <div className="font-bold text-lg text-gray-900 mt-2">
                {user?.name || "Người dùng"}
              </div>
              <div className="text-gray-500 text-sm flex items-center gap-2">
                <span>Người theo dõi</span>
                <span className="font-semibold text-black">1</span>
                <span>· Đang theo dõi</span>
                <span className="font-semibold text-black">0</span>
              </div>
              {/* Info card */}
              <div className="w-full bg-white rounded-lg shadow-sm border mt-3 p-3">
                <div className="flex justify-between text-sm text-gray-700 mb-1">
                  <span>TK Định danh</span>
                  <span className="font-medium">{user?._id}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                  <span>Đồng Tốt</span>
                  <span className="font-semibold text-yellow-600">
                    {formatVND(user?.wallet.balance)}
                  </span>
                </div>
                <Link to="/wallet/recharge">
                  <Button className="w-full bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500">
                    Nạp ngay
                  </Button>
                </Link>
              </div>
            </div>

            {/* Tiện ích */}
            <div className="px-5 py-3">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Tiện ích
              </div>
              <div className="flex flex-col gap-2">
                <DropdownMenuItem className="flex items-center gap-3 rounded-md hover:bg-yellow-50 cursor-pointer">
                  <AiOutlineHeart /> Tin đăng đã lưu
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 rounded-md hover:bg-yellow-50 cursor-pointer">
                  <FaSearch /> Tìm kiếm đã lưu
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 rounded-md hover:bg-yellow-50 cursor-pointer">
                  <AiOutlineClockCircle /> Lịch sử xem tin
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 rounded-md hover:bg-yellow-50 cursor-pointer">
                  <AiOutlineStar /> Đánh giá từ tôi
                </DropdownMenuItem>
              </div>
            </div>

            {/* Dịch vụ trả phí */}
            <div className="px-5 py-3">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Dịch vụ trả phí
              </div>
              <div className="flex flex-col gap-2">
                <DropdownMenuItem className="flex items-center gap-3 hover:bg-yellow-50 rounded-md">
                  <FaGift /> Đồng Tốt
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 hover:bg-yellow-50 rounded-md">
                  <FaGift /> Gói PRO
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 hover:bg-yellow-50 rounded-md">
                  <FaGift /> Kênh Đối Tác
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 hover:bg-yellow-50 rounded-md">
                  <AiOutlineClockCircle /> Lịch sử giao dịch
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 hover:bg-yellow-50 rounded-md">
                  <FaStore /> Cửa hàng / chuyên trang
                  <span className="ml-auto bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs">
                    Tạo ngay
                  </span>
                </DropdownMenuItem>
              </div>
            </div>

            {/* Ưu đãi */}
            <div className="px-5 py-3">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Ưu đãi
              </div>
              <div className="flex flex-col gap-2">
                <DropdownMenuItem className="flex items-center gap-3 hover:bg-yellow-50 rounded-md">
                  <FaGift /> Chợ Tốt ưu đãi
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 hover:bg-yellow-50 rounded-md">
                  <FaGift /> Ưu đãi của tôi
                </DropdownMenuItem>
              </div>
            </div>

            {/* Khác */}
            <div className="px-5 py-3">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Khác
              </div>
              <div className="flex flex-col gap-2">
                <DropdownMenuItem className="flex items-center gap-3 hover:bg-yellow-50 rounded-md">
                  <AiOutlineSetting /> Cài đặt tài khoản
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                >
                  <RiLogoutBoxLine />
                  Đăng xuất
                </DropdownMenuItem>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
