import { Outlet } from "react-router-dom";
import React from "react";
import Header from "./components/base/Header";
import Footer from "@/components/Footer";

const BaseLayout: React.FC = () => {
  return (
    <div className="subpixel-antialiased bg-gray-100 min-h-screen">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default BaseLayout;
