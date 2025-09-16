// StandardLayout.tsx
import { Outlet } from "react-router-dom";
import React from "react";
import FixedHeader from "./components/base/FixedHeader";

const StandardLayout: React.FC = () => {
  return (
    <div className="subpixel-antialiased">
      <FixedHeader />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default StandardLayout;
