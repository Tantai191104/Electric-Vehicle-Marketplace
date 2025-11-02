import { Mail, MessageCircle } from 'lucide-react';

export const ContactSection: React.FC = () => {
    return (
        <div className="mt-20 text-center">
            <div className="max-w-2xl mx-auto bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-12 border border-slate-200">
                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                    Cần tư vấn thêm?
                </h3>
                <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                    Đội ngũ của chúng tôi sẵn sàng hỗ trợ bạn tìm gói dịch vụ phù hợp nhất
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                        <Mail className="w-5 h-5" />
                        Gửi email
                    </button>
                    <button className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-semibold px-8 py-4 rounded-xl transition-all duration-200 border-2 border-slate-200 hover:border-slate-300">
                        <MessageCircle className="w-5 h-5" />
                        Chat ngay
                    </button>
                </div>
            </div>
        </div>
    );
};