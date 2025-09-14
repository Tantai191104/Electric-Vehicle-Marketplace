import React from "react";
import { FiUser, FiLock, FiArrowRight, FiMail, FiPhone } from "react-icons/fi";
import InputWithIcon from "./InputWithIcon";

const RegisterForm: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  return (
    <>
      <h3 className="text-gray-800 text-2xl font-semibold mb-12 max-w-sm leading-snug">
        Đăng ký để tham gia cộng đồng mua bán xe điện
      </h3>

      <form className="flex flex-col gap-6">
        <InputWithIcon
          type="text"
          placeholder="Tên đăng nhập"
          icon={<FiUser className="text-gray-400 text-xl" />}
        />
        <InputWithIcon
          type="email"
          placeholder="Email"
          icon={<FiMail className="text-gray-400 text-xl" />}
        />
        <InputWithIcon
          type="tel"
          placeholder="Số điện thoại"
          icon={<FiPhone className="text-gray-400 text-xl" />}
        />
        <InputWithIcon
          type="password"
          placeholder="Mật khẩu"
          icon={<FiLock className="text-gray-400 text-xl" />}
        />
        <InputWithIcon
          type="password"
          placeholder="Nhập lại mật khẩu"
          icon={<FiLock className="text-gray-400 text-xl" />}
        />

        <div className="flex justify-between items-center mt-4">
          <button
            type="submit"
            className="cursor-pointer bg-yellow-500 text-white py-4 px-8 rounded-md font-semibold text-lg flex items-center gap-3 hover:bg-yellow-600 transition-all duration-300 shadow-lg"
          >
            Đăng ký
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
