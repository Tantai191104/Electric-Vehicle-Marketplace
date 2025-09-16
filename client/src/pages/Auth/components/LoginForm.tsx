import React from "react";
import { FiUser, FiLock, FiArrowRight } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import InputWithIcon from "./InputWithIcon";

// 🎯 Schema validation bằng Zod
const loginSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});
// Tự động infer type từ schema
type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm: React.FC<{
  onSwitch: () => void;
  onSubmit: (data: LoginFormData) => void;
  isLoading?: boolean;
}> = ({ onSwitch, onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <>
      <h3 className="text-gray-800 text-2xl font-semibold mb-12 max-w-sm leading-snug">
        Đăng nhập để truy cập tài khoản của bạn
      </h3>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <div className="flex flex-col gap-1">
          <InputWithIcon
            type="text"
            placeholder="Tên đăng nhập hoặc Email"
            icon={<FiUser className="text-gray-400 text-xl" />}
            {...register("email")}
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email.message}</span>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <InputWithIcon
            type="password"
            placeholder="Mật khẩu"
            icon={<FiLock className="text-gray-400 text-xl" />}
            {...register("password")}
          />
          {errors.password && (
            <span className="text-red-500 text-sm">
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer bg-yellow-500 text-white py-4 px-8 rounded-md font-semibold text-lg flex items-center gap-3 hover:bg-yellow-600 transition-all duration-300 shadow-lg disabled:opacity-70"
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            <FiArrowRight className="text-xl" />
          </button>

          <button
            type="button"
            onClick={onSwitch}
            className="relative text-gray-500 text-base font-medium after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-yellow-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            Chưa có tài khoản? Đăng ký
          </button>
        </div>
      </form>
    </>
  );
};

export default LoginForm;
