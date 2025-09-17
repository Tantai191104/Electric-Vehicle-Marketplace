import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => (
  <footer className="bg-gradient-to-b from-gray-950 via-black to-gray-900 pt-14 pb-10 px-4 mt-20">
    {/* Đăng ký nhận tin */}
    <div className="max-w-4xl mx-auto bg-gradient-to-r from-gray-800 via-gray-900 to-black rounded-2xl p-10 mb-10 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
      <div className="flex-1 text-gray-100">
        <h3 className="font-semibold text-2xl mb-2">
          Đăng ký ngay để không bỏ lỡ chương trình mới!
        </h3>
        <p className="text-gray-400 text-base">
          Nhận thông tin ưu đãi và cập nhật mới nhất về xe điện.
        </p>
      </div>
      <form className="flex gap-2 w-full md:w-auto">
        <Input
          type="email"
          placeholder="Nhập email của bạn"
          className="bg-gray-100 text-gray-900 w-64 h-12 rounded-l-lg border-none outline-none shadow"
        />
        <Button
          type="submit"
          className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold px-7 h-12 rounded-r-lg hover:opacity-90 transition shadow"
        >
          Đăng ký
        </Button>
      </form>
    </div>

    {/* Links + Social */}
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-100 text-base py-7 border-t border-gray-700">
      <div className="flex gap-10 mb-4 md:mb-0">
        <a href="#" className="hover:text-amber-400 transition font-medium">
          Trang chủ
        </a>
        <a href="#" className="hover:text-amber-400 transition font-medium">
          Danh mục
        </a>
        <a href="#" className="hover:text-amber-400 transition font-medium">
          Giới thiệu
        </a>
        <a href="#" className="hover:text-amber-400 transition font-medium">
          Liên hệ
        </a>
      </div>
      <div className="flex gap-6 mb-4 md:mb-0">
        <a href="#" aria-label="Facebook">
          <svg
            width="22"
            height="22"
            fill="currentColor"
            className="text-gray-300 hover:text-amber-400 transition"
          >
            <path d="M17 1H5C2.8 1 1 2.8 1 5v12c0 2.2 1.8 4 4 4h6v-7H9v-3h2V8.5C11 6.6 12.1 5.7 13.8 5.7c.7 0 1.4.1 1.6.1v2h-1c-.8 0-1 .4-1 1V9h2.5l-.5 3H14v7h3c2.2 0 4-1.8 4-4V5c0-2.2-1.8-4-4-4z" />
          </svg>
        </a>
        <a href="#" aria-label="Twitter">
          <svg
            width="22"
            height="22"
            fill="currentColor"
            className="text-gray-300 hover:text-amber-400 transition"
          >
            <path d="M22 5.9c-.8.4-1.7.7-2.6.8.9-.5 1.6-1.3 1.9-2.2-.8.5-1.8.9-2.8 1.1C17.5 4.6 16.4 4 15.2 4c-2.3 0-4.1 1.9-4.1 4.1 0 .3 0 .6.1.9C7.4 8.8 4.1 7.1 1.7 4.7c-.4.7-.6 1.5-.6 2.3 0 1.6.8 3 2.1 3.8-.7 0-1.4-.2-2-.5v.1c0 2.2 1.6 4 3.7 4.4-.4.1-.8.2-1.2.2-.3 0-.6 0-.8-.1.6 1.8 2.3 3.1 4.3 3.1-1.6 1.2-3.6 1.9-5.7 1.9-.4 0-.8 0-1.2-.1C2.1 20.3 4.6 21 7.2 21c8.6 0 13.3-7.1 13.3-13.3 0-.2 0-.4 0-.6.9-.7 1.6-1.4 2.2-2.2z" />
          </svg>
        </a>
        <a href="#" aria-label="Instagram">
          <svg
            width="22"
            height="22"
            fill="currentColor"
            className="text-gray-300 hover:text-amber-400 transition"
          >
            <circle cx="11" cy="11" r="4" />
            <path d="M16.7 2H5.3C3.5 2 2 3.5 2 5.3v11.4C2 18.5 3.5 20 5.3 20h11.4c1.8 0 3.3-1.5 3.3-3.3V5.3C20 3.5 18.5 2 16.7 2zm1.6 14.7c0 .9-.7 1.6-1.6 1.6H5.3c-.9 0-1.6-.7-1.6-1.6V5.3c0-.9.7-1.6 1.6-1.6h11.4c.9 0 1.6.7 1.6 1.6v11.4z" />
            <circle cx="16.2" cy="5.8" r="1" />
          </svg>
        </a>
      </div>
      <div className="text-gray-400 text-sm">
        &copy; 2025 EV Marketplace. All rights reserved.
      </div>
    </div>

    {/* Extra bottom */}
    <div className="max-w-4xl mx-auto flex justify-between text-gray-500 text-xs mt-5">
      <span className="font-semibold tracking-wide text-gray-300">
        EV Marketplace
      </span>
      <div className="flex gap-8">
        <a href="#" className="hover:text-amber-400 transition">
          Điều khoản
        </a>
        <a href="#" className="hover:text-amber-400 transition">
          Chính sách bảo mật
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
