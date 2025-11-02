import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    FaHome,
    FaUser,
    FaClipboardList,
    FaSignOutAlt,
    FaBars,
    FaCar,
    FaBolt,
    FaCarSide,
    FaRegIdCard,
    FaWallet,
} from "react-icons/fa";
import { useAuthStore } from "@/store/auth";
import { authServices } from "@/services/authServices";

const adminLinks = [
    { to: "/admin", label: "Dashboard", icon: <FaHome /> },
    { to: "/admin/users", label: "Người dùng", icon: <FaUser /> },
    { to: "/admin/products", label: "Sản phẩm", icon: <FaCarSide /> },
    { to: "/admin/orders", label: "Đơn hàng", icon: <FaClipboardList /> },
    { to: "/admin/subscriptions", label: "Gói đăng ký", icon: <FaRegIdCard /> },
    { to: "/admin/deposits", label: "Mức đặt cọc", icon: <FaWallet /> },
];

export default function SideBar() {
    const { pathname } = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [autoCollapsed, setAutoCollapsed] = useState(false);
    const logout = useAuthStore((s) => s.clearAuth);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 900) {
                setAutoCollapsed(true);
                setCollapsed(true);
            } else {
                setAutoCollapsed(false);
                setCollapsed(false);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleLogout = async () => {
        await authServices.logout();
        logout();
        setTimeout(() => {
            window.location.href = "/auth/login";
        }, 800);
    };

    return (
        <aside
            className={`bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-500 ease-in-out ${collapsed ? "w-20" : "w-64"
                }`}
        >
            {/* Logo & Toggle */}
            <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
                {!collapsed && (
                    <div className="flex items-center h-[40px] whitespace-nowrap">
                        <div className="relative h-10 w-10 mr-3 bg-yellow-400 rounded-lg flex items-center justify-center">
                            <FaCar className="text-black text-lg" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-black rounded-full flex items-center justify-center">
                                <FaBolt className="text-yellow-400 text-xs" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-black">EV Market</span>
                            <span className="text-xs text-gray-500 -mt-1">Admin Panel</span>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => {
                        if (autoCollapsed && collapsed) setAutoCollapsed(false);
                        setCollapsed(!collapsed);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                    <FaBars className="text-gray-600" />
                </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 overflow-auto mt-6 px-3">
                <ul className="space-y-2">
                    {adminLinks.map((item, idx) => {
                        const isActive = pathname === item.to;
                        return (
                            <li key={item.to}>
                                <Link
                                    to={item.to}
                                    className={`group flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300
                    ${isActive
                                            ? "bg-yellow-400 text-black shadow"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    style={{
                                        transition: `all 0.3s ${0.05 * idx}s ease-out`,
                                    }}
                                >
                                    <span
                                        className={`text-lg ${isActive
                                            ? "text-black"
                                            : "text-gray-500 group-hover:text-black"
                                            }`}
                                    >
                                        {item.icon}
                                    </span>
                                    {!collapsed && (
                                        <span className="truncate text-sm font-medium">
                                            {item.label}
                                        </span>
                                    )}
                                    {!collapsed && isActive && (
                                        <div className="ml-auto w-2 h-2 bg-black rounded-full"></div>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User info + Logout */}
            <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between gap-3">
                    {!collapsed && (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                                <FaUser className="text-black text-xs" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-black">Admin</span>
                                <span className="text-xs text-gray-500">Quản trị viên</span>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-9 h-9 rounded-lg bg-black text-white hover:bg-gray-800 transition"
                        title="Đăng xuất"
                    >
                        <FaSignOutAlt className="text-sm" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
