import React from "react";
import { BounceLoader } from "react-spinners";

const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/30 backdrop-blur-md animate-fade-in">
      <img
        src="/vite.svg"
        alt="Logo"
        className="w-16 h-16 mb-4 drop-shadow-lg animate-fade-in"
      />
      <div className="flex items-center justify-center w-24 h-24 bg-white/80 rounded-full shadow-xl animate-fade-in">
        <BounceLoader color="#eab308" size={48} speedMultiplier={1.3} />
      </div>
      <div className="mt-6 text-yellow-700 font-semibold text-lg animate-pulse tracking-wide drop-shadow text-center">
        Đang tải dữ liệu, vui lòng chờ...
      </div>
    </div>
  );
};
export default Loading;
