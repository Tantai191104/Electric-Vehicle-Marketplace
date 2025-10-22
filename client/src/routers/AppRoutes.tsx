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
import SignContractPage from "@/pages/contract/SignContractPage";
import ContractEditorPage from "@/pages/contract/ContractEditorPage";
import ProductDetailPage from "@/pages/detail/ProductDetailPage";
import OrderPage from "@/pages/order/OrderPage";
import CheckoutPage from "@/pages/checkout/CheckoutPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import SubscriptionPage from "@/pages/subscription/SubscriptionPage";
import AdminLayout from "@/layouts/AdminLayout";
import UserManage from "@/pages/admin/user/UserManage";
import ProductManage from "@/pages/admin/product/ProductManage";
import DashboardPage from "@/pages/admin/dashboard/DashboardPage";
import TransactionsPage from "@/pages/transaction/TransactionsPage";
import OwnProduct from "@/pages/Product/own/OwnProduct";
import OrderManage from "@/pages/admin/orders/OrderManage";
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
        <Route element={<BaseLayout />}>
          <Route path="/" element={animatePage(<HomePage />)} />
        </Route>
        <Route element={<StandardLayout />}>
          <Route path="/cars" element={animatePage(<CarProductList />)} />
          <Route path="/motorbikes" element={animatePage(<MotorbikeProductList />)} />
          <Route path="/detail/:id" element={animatePage(<ProductDetailPage />)} />
        </Route>

        <Route element={<ProtectedRoute role="user" />}>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:id" element={<ChatPage />} />
          <Route path="/checkout/:productId/:quantity" element={<CheckoutPage />} />

          <Route element={<StandardLayout />}>
            <Route path="/articles/create" element={animatePage(<EditorPage />)} />
            <Route path="/contracts/sign/:productId" element={animatePage(<SignContractPage />)} />
            <Route path="/contracts/edit/:productId" element={animatePage(<ContractEditorPage />)} />
            <Route path="/profile" element={animatePage(<ProfilePage />)} />
            <Route path="/wallet/recharge" element={animatePage(<WalletTopupPage />)} />
            <Route path="/orders" element={animatePage(<OrderPage />)} />
            <Route path="/subscriptions" element={animatePage(<SubscriptionPage />)} />
            <Route path="/transactions" element={animatePage(<TransactionsPage />)} />
            <Route path="/own/product" element={animatePage(<OwnProduct />)} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route
              index
              element={animatePage(<DashboardPage />)} // Đây sẽ là trang mặc định khi vào /admin
            />
            {/* Các route con khác */}
            <Route
              path="users"
              element={animatePage(<UserManage />)}
            />
            <Route path="orders" element={animatePage(<OrderManage />)} />
            <Route path="products" element={animatePage(<ProductManage />)} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
