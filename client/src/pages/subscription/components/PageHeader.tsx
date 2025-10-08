import { motion } from "framer-motion";
import { FiTarget } from "react-icons/fi";

export const PageHeader: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
        >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-lg mb-6">
                <FiTarget className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Chọn gói phù hợp với bạn
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Từ miễn phí đến enterprise, chúng tôi có gói dịch vụ phù hợp với mọi quy mô kinh doanh.
            </p>
        </motion.div>
    );
};