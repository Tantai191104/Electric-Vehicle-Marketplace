
import { Outlet } from "react-router-dom"
import SideBar from "./components/base/Sidebar";

export default function AdminLayout() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <SideBar />
            <main className="flex-1 p-8 bg-white border-l border-gray-200">
                <Outlet />
            </main>
        </div>
    );
}
