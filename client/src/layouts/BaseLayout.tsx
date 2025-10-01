import { Outlet } from "react-router-dom";
import React from "react";
import Header from "./components/base/Header";
import Footer from "./components/base/Footer";

const BaseLayout: React.FC = () => {
  return (
    <div className="subpixel-antialiased bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen flex flex-col">
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default BaseLayout;
