// SideBar.jsx
import { useState } from "react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    FaHome,
    FaUser,
    FaClipboardList,
    FaSignOutAlt,
    FaBars,
    FaCar,
    FaChargingStation,
    FaBolt,
} from "react-icons/fa";
import { useAuthStore } from "@/store/auth";
import { authServices } from "@/services/authServices";

const adminLinks = [
    { to: "/admin", label: "Dashboard", icon: <FaHome /> },
    { to: "/admin/users", label: "Người dùng", icon: <FaUser /> },
    { to: "/admin/orders", label: "Đơn hàng", icon: <FaClipboardList /> },
    { to: "/admin/vehicles", label: "Xe điện", icon: <FaCar /> },
    { to: "/admin/stations", label: "Trạm sạc", icon: <FaChargingStation /> },
    { to: "/admin/subscriptions", label: "Gói đăng ký", icon: <FaBolt /> },
];

export default function SideBar() {
    const { pathname } = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [autoCollapsed, setAutoCollapsed] = useState(false);
    const logout = useAuthStore((s) => s.clearAuth);

    // Tự động collapse khi màn hình nhỏ hơn 900px
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
        }, 1200);
    };

    return (
        <aside
            className={`bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 min-h-screen flex flex-col transition-all duration-500 ease-in-out ${collapsed ? "w-20 shadow-md" : "w-72 shadow-2xl"
                }`}
            style={{
                boxShadow: collapsed
                    ? "0 2px 8px rgba(0,0,0,0.08)"
                    : "0 4px 24px rgba(16, 185, 129, 0.15)",
            }}
        >
            {/* Logo & Toggle */}
            <div className="flex items-center justify-between px-4 py-6 border-b border-gray-700">
                {!collapsed && (
                    <div className="flex items-center h-[40px] whitespace-nowrap">
                        {/* Electric Vehicle Icon */}
                        <div className="relative h-10 w-10 mr-3 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                            <FaCar className="text-white text-lg" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                                <FaBolt className="text-gray-900 text-xs" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span
                                className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                }}
                            >
                                EV Market
                            </span>
                            <span className="text-xs text-gray-400 -mt-1">
                                Admin Panel
                            </span>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => {
                        // Nếu đang autoCollapsed thì mở sidebar thủ công sẽ tắt autoCollapsed
                        if (autoCollapsed && collapsed) {
                            setAutoCollapsed(false);
                        }
                        setCollapsed(!collapsed);
                    }}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105"
                >
                    <FaBars className="text-gray-300" />
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
                                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02]
                                        ${isActive
                                            ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg scale-[1.02]"
                                            : "hover:bg-gray-700/50 hover:text-white text-gray-300"
                                        }
                                    `}
                                    style={{
                                        opacity: collapsed ? 0.8 : 1,
                                        transform: collapsed ? "translateX(-5px)" : "translateX(0)",
                                        transition: `all 0.4s ${0.05 * idx}s ease-out`,
                                    }}
                                >
                                    <span
                                        className={`text-lg transition-all duration-300 ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"
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
                                        <div className="ml-auto w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User info section */}
            {!collapsed && (
                <div className="px-4 py-3 border-t border-gray-700 bg-gray-800/50">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <FaUser className="text-white text-xs" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">Admin</span>
                            <span className="text-xs text-gray-400">Quản trị viên</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout button */}
            <div className={`mt-2 ${collapsed ? "px-2 py-2" : "px-4 py-4"}`}>
                <button
                    className={`group flex items-center w-full px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-[1.02]
                        ${collapsed ? "justify-center" : "justify-center gap-3"}
                    `}
                    onClick={handleLogout}
                >
                    <FaSignOutAlt className="text-base text-white" />
                    {!collapsed && (
                        <span className="text-sm text-white font-medium">
                            Đăng xuất
                        </span>
                    )}
                </button>
            </div>
        </aside>
    );
}
