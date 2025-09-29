import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

export const ContactSection: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-center mt-16"
        >
            <div className="bg-white rounded-lg p-8 border border-gray-200 inline-block">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Cần hỗ trợ tùy chỉnh?
                </h3>
                <p className="text-gray-600 mb-6 max-w-md">
                    Liên hệ với đội ngũ bán hàng để được tư vấn gói dịch vụ phù hợp nhất.
                </p>
                <motion.button
                    className="bg-gray-900 hover:bg-black text-white font-medium px-6 py-3 rounded-md transition-colors duration-200 flex items-center gap-2 mx-auto"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Liên hệ bán hàng
                    <FiArrowRight className="w-4 h-4" />
                </motion.button>
            </div>
        </motion.div>
    );
};