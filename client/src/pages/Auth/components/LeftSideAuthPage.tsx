import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

const textVariants = {
  hidden: { opacity: 0, y: 30 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
};

interface LeftSideProps {
  isLogin: boolean;
}

const LeftSideAuthPage: React.FC<LeftSideProps> = ({ isLogin }) => {
  return (
    <div className="hidden md:flex w-1/2 bg-black text-white flex-col justify-between p-32">
      {/* Logo */}
      <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 animate-pulse">
        Chợ xe điện cũ
      </span>

      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.h2
            key={isLogin ? "loginText" : "registerText"}
            variants={textVariants}
            initial="hidden"
            animate="enter"
            exit="exit"
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="text-5xl font-extrabold leading-snug max-w-md"
          >
            {isLogin ? (
              <>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-300 to-yellow-200 animate-pulse">
                  Chào mừng quay lại
                </span>
                <span className="block mt-4 text-gray-300 font-light text-2xl">
                  Để xem hôm nay chợ có gì mới !
                </span>
              </>
            ) : (
              <>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-400 animate-pulse">
                  Một nơi cho tất cả
                </span>
                <span className="block mt-4 text-gray-300 font-light text-2xl">
                  Chúng tôi kết nối bạn với cộng đồng mua bán xe điện
                </span>
              </>
            )}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* Button + Links */}
      <div className="mt-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-3 px-8 py-3 mb-6 bg-white text-black rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-yellow-400/50 hover:bg-yellow-50"
        >
          Tìm hiểu thêm
          <FiArrowRight className="text-xl" />
        </motion.button>

        <div className="flex gap-6 text-sm opacity-80">
          <a href="#" className="hover:text-yellow-400 hover:underline">
            Giới thiệu
          </a>
          <a href="#" className="hover:text-yellow-400 hover:underline">
            Điều khoản
          </a>
          <a href="#" className="hover:text-yellow-400 hover:underline">
            Liên hệ
          </a>
        </div>
      </div>
    </div>
  );
};

export default LeftSideAuthPage;
