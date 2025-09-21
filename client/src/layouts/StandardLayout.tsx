// StandardLayout.tsx
import { Outlet } from "react-router-dom";
import React from "react";
import FixedHeader from "./components/base/FixedHeader";
import Footer from "@/components/Footer";

const StandardLayout: React.FC = () => {
  return (
    <div className="subpixel-antialiased">
      <FixedHeader />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default StandardLayout;
