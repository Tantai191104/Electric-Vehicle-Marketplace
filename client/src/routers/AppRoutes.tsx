import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import AuthPage from "@/pages/Auth/AuthPage";
import BaseLayout from "@/layouts/BaseLayout";
import HomePage from "@/pages/Home/HomePage";

const pageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 },
};

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="min-h-screen"
      >
        <Routes location={location} key={location.pathname}>
          {/* Auth layout */}
          <Route path="/auth/login" element={<AuthPage mode="login" />} />
          <Route path="/auth/register" element={<AuthPage mode="register" />} />

          {/* App layout */}
          <Route element={<BaseLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
