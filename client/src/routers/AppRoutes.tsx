import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import AuthPage from "@/pages/Auth/AuthPage";
import BaseLayout from "@/layouts/BaseLayout";
import HomePage from "@/pages/Home/HomePage";
import ProfilePage from "@/pages/profile/ProfilePage";
import type { JSX } from "react";
import StandardLayout from "@/layouts/StandardLayout";

const pageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 },
};

export default function App() {
  const location = useLocation();

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
        {/* Auth layout */}
        <Route
          path="/auth/login"
          element={animatePage(<AuthPage mode="login" />)}
        />
        <Route
          path="/auth/register"
          element={animatePage(<AuthPage mode="register" />)}
        />

        {/* App layout */}
        <Route element={<BaseLayout />}>
          <Route path="/" element={animatePage(<HomePage />)} />
        </Route>
        <Route element={<StandardLayout />}>
          <Route path="/profile" element={animatePage(<ProfilePage />)} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
