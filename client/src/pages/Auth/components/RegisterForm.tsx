import React from "react";
import { FiUser, FiLock, FiArrowRight, FiMail, FiPhone } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import InputWithIcon from "./InputWithIcon";

const registerSchema = z
  .object({
    name: z.string().min(2, "Tên phải ít nhất 2 ký tự"),
    email: z.email("Email không hợp lệ"),
    phone: z.string().min(10, "Số điện thoại không hợp lệ"),
    password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu và xác nhận mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSwitch: () => void;
  onSubmit: (data: RegisterFormData) => void;
  isLoading?: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitch,
  onSubmit,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <>
      <h3 className="text-gray-800 text-2xl font-semibold mb-12 max-w-sm leading-snug">
        Đăng ký để tham gia cộng đồng mua bán xe điện
      </h3>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-1">
          <InputWithIcon
            type="text"
            placeholder="Tên đăng nhập"
            icon={<FiUser className="text-gray-400 text-xl" />}
            {...register("name")}
          />
          {errors.name && (
            <span className="text-red-500 text-sm">{errors.name.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <InputWithIcon
            type="email"
            placeholder="Email"
            icon={<FiMail className="text-gray-400 text-xl" />}
            {...register("email")}
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <InputWithIcon
            type="tel"
            placeholder="Số điện thoại"
            icon={<FiPhone className="text-gray-400 text-xl" />}
            {...register("phone")}
          />
          {errors.phone && (
            <span className="text-red-500 text-sm">{errors.phone.message}</span>
          )}
        </div>

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

        <div className="flex flex-col gap-1">
          <InputWithIcon
            type="password"
            placeholder="Nhập lại mật khẩu"
            icon={<FiLock className="text-gray-400 text-xl" />}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <span className="text-red-500 text-sm">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer bg-yellow-500 text-white py-4 px-8 rounded-md font-semibold text-lg flex items-center gap-3 hover:bg-yellow-600 transition-all duration-300 shadow-lg disabled:opacity-70"
          >
            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            <FiArrowRight className="text-xl" />
          </button>

          <button
            type="button"
            onClick={onSwitch}
            className="relative text-gray-500 text-base font-medium after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-yellow-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            Tôi đã có tài khoản
          </button>
        </div>
      </form>
    </>
  );
};

export default RegisterForm;
