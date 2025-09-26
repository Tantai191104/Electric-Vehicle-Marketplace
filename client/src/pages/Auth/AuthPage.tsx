import React, { useState } from "react";
import { FiArrowLeft, FiMenu } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLoginMutation, useRegisterMutation } from "@/hooks/useAuth";
import { toast } from "sonner";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import LeftSideAuthPage from "./components/LeftSideAuthPage";
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

    // Gọi mutation
    const loginMutation = useLoginMutation();
    const registerMutation = useRegisterMutation(); // Thay đổi nếu có mutation đăng ký riêng
    const handleLogin = async (data: { email: string; password: string }) => {
        try {
            const response = await loginMutation.mutateAsync(data);
            const { ...user } = response;
            console.log("Login response:", response);

            // Redirect dựa trên role
            if (user.role === "admin") {
                navigation("/admin");
            } else {
                navigation("/");
            }

            window.scrollTo(0, 0);
        } catch (error) {
            console.error("Login failed:", error);
            toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
        }
    };
    const handleRegister = async (data: {
        name: string;
        email: string;
        password: string;
        phone: string;
    }) => {
        try {
            await registerMutation.mutateAsync(data);
            setIsLogin(true); // Chuyển về form đăng nhập sau khi đăng ký thành công
        } catch (error) {
            console.error("Registration failed:", error);
        }
    };
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
                                <LoginForm
                                    onSwitch={() => setIsLogin(false)}
                                    onSubmit={handleLogin}
                                    isLoading={loginMutation.isPending}
                                />
                            ) : (
                                <RegisterForm
                                    onSwitch={() => setIsLogin(true)}
                                    onSubmit={handleRegister}
                                    isLoading={registerMutation.isPending}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;