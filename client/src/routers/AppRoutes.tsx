import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import AuthPage from "@/pages/Auth/AuthPage";
import BaseLayout from "@/layouts/BaseLayout";
import HomePage from "@/pages/Home/HomePage";
import ProfilePage from "@/pages/profile/ProfilePage";
import type { JSX } from "react";
import StandardLayout from "@/layouts/StandardLayout";
import CarProductList from "@/pages/Product/Car/CarProductList";
import MotorbikeProductList from "@/pages/Product/Motorbike/MotorbikeProductList";
import WalletTopupPage from "@/pages/zalopay/WalletTopupPage";
import { ChatPage } from "@/pages/chat/ChatPage";
import EditorPage from "@/pages/article/EditorPage";
import ProductDetailPage from "@/pages/detail/ProductDetailPage";


const pageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 },
};

export default function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const animatePage = (Component: JSX.Element) => (
    <motion.div
      key={location.pathname}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="min-h-screen"
    >
      {Component}
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/auth/login"
          element={animatePage(<AuthPage mode="login" />)}
        />
        <Route
          path="/auth/register"
          element={animatePage(<AuthPage mode="register" />)}
        />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />

        {/* App layout */}
        <Route element={<BaseLayout />}>
          <Route path="/" element={animatePage(<HomePage />)} />
        </Route>
        <Route element={<StandardLayout />}>
          <Route path="/articles/new" element={animatePage(<EditorPage />)} />
          <Route path="/profile" element={animatePage(<ProfilePage />)} />
          <Route path="/wallet/recharge" element={animatePage(<WalletTopupPage />)} />
          <Route path="/cars" element={animatePage(<CarProductList />)} />
          <Route path="/motorbikes" element={animatePage(<MotorbikeProductList />)} />
          <Route path="/detail/:id" element={animatePage(<ProductDetailPage />)} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
