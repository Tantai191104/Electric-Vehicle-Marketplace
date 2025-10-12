
import { Outlet } from "react-router-dom"
import SideBar from "./components/base/Sidebar";

export default function AdminLayout() {
    return (
        <div className="flex h-screen bg-gray-50">
            <SideBar />
            <main className="flex-1 bg-white border-l border-gray-200 overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
}
