// StandardLayout.tsx
import { Outlet } from "react-router-dom";
import React from "react";
import FixedHeader from "./components/base/FixedHeader";
import Footer from "./components/base/Footer";


const StandardLayout: React.FC = () => {
  return (
    <div className="subpixel-antialiased">
      <FixedHeader />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default StandardLayout;
