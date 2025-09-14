import Header from "./components/base/Header";

/**
 * Components
 */

import React from "react";

interface BaseLayoutProps {
  children?: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <div className="subpixel-antialiased">
      <Header />
      <main>{children}</main>
    </div>
  );
};

export default BaseLayout;
