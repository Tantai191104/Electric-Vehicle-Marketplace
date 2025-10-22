import { motion } from "framer-motion";
import { FiTarget } from "react-icons/fi";

export const PageHeader: React.FC = () => {
    return (
        <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-14"
        >
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 text-gray-800 rounded-xl mb-5 shadow-sm">
                <FiTarget className="w-7 h-7" />
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3">
                Chọn gói phù hợp với bạn
            </h1>

            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                Từ miễn phí đến doanh nghiệp, chúng tôi có gói phù hợp cho mọi quy mô kinh doanh.
            </p>
        </motion.header>
    );
};
