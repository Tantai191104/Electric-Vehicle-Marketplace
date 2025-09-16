import React, { forwardRef } from "react";

interface InputWithIconProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
}

const InputWithIcon = forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ type, placeholder, icon, className, ...props }, ref) => {
    return (
      <div className="flex items-center border-b border-gray-300 py-4 focus-within:border-yellow-500 transition-all duration-300">
        {icon}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`bg-transparent outline-none flex-1 text-gray-800 placeholder-gray-400 ml-3 text-lg font-medium ${
            className ?? ""
          }`}
          {...props}
        />
      </div>
    );
  }
);

InputWithIcon.displayName = "InputWithIcon";

export default InputWithIcon;
