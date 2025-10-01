import Rectangle9 from "/banner/Rectangle 9.svg";
const Banner2 = () => {
  return (
    <div className="bg-gradient-to-br from-amber-50 via-white to-amber-100 py-8">
      <div className="max-w-7xl mx-auto px-6 flex items-center relative overflow-hidden rounded-2xl shadow-xl min-h-[400px]">
        <img
          src="/banner/file1.svg"
          alt="Banner"
          className="max-h-[340px] object-contain rounded-l-2xl drop-shadow-lg z-10"
        />
        <img
          src={Rectangle9}
          alt="Rectangle 9"
          className="absolute right-0 top-0 h-full object-cover pointer-events-none z-20 filter brightness-0"
        />
        <div className="absolute right-12 top-1/2 -translate-y-1/2 z-20 p-8 flex flex-col items-start max-w-xl ">
          <h1 className="text-4xl font-bold text-amber-400 drop-shadow mb-3">
            Khám phá xe điện hiện đại
          </h1>
          <p className="text-lg text-white mb-3">
            Năng lượng xanh - Tương lai di chuyển thông minh
          </p>
          <p className="text-base text-gray-200 mb-6">
            Đa dạng mẫu mã, tiết kiệm chi phí, bảo vệ môi trường.
            <br />
            Hãy chọn xe điện phù hợp với bạn ngay hôm nay!
          </p>
          <button className="bg-amber-400 hover:bg-amber-500 text-black font-semibold py-2 px-7 rounded-lg shadow transition duration-200 text-lg">
            Xem danh sách xe
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banner2;
