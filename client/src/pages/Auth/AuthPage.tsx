import React, { useState } from "react";
import { FiArrowLeft, FiMenu } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import LeftSideAuthPage from "./components/LeftSideAuthPage";
import { useNavigate } from "react-router-dom";

const formVariants = {
  hidden: { opacity: 0, x: 50 },
  enter: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};
interface AuthPageProps {
  mode: "login" | "register";
}
const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const [isLogin, setIsLogin] = useState(mode === "login");
  const navigation = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-500 via-yellow-600 to-[#4B3B2B]">
      <div className="w-full max-w-[1400px] h-[800px] rounded-xl shadow-2xl flex overflow-hidden">
        {/* Bên trái */}
        <LeftSideAuthPage isLogin={isLogin} />

        {/* Bên phải */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center p-32 relative overflow-hidden">
          {/* Nút trở về trang chủ */}
          <button
            onClick={() => (navigation("/"), window.scrollTo(0, 0))}
            className="absolute top-8 left-8 text-gray-600 hover:text-yellow-600 flex items-center gap-2"
          >
            <FiArrowLeft className="text-2xl" />
            <span className="hidden md:inline font-medium cursor-pointer">
              Trang chủ
            </span>
          </button>

          {/* Nút Menu */}
          <button className="absolute top-8 right-8 text-gray-500 hover:text-yellow-500">
            <FiMenu className="text-3xl" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "loginForm" : "registerForm"}
              variants={formVariants}
              initial="hidden"
              animate="enter"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex flex-col"
            >
              {isLogin ? (
                <LoginForm onSwitch={() => setIsLogin(false)} />
              ) : (
                <RegisterForm onSwitch={() => setIsLogin(true)} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
