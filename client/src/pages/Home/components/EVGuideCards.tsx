const guides = [
  {
    image: "/images/ev1.jpg",
    tag: "Kiến thức xe điện",
    title: "Cách chọn xe điện phù hợp với nhu cầu",
    desc: "Hướng dẫn xác định loại xe điện phù hợp với mục đích sử dụng, ngân sách và sở thích cá nhân.",
  },
  {
    image: "/images/ev2.jpg",
    tag: "Bảo dưỡng",
    title: "Bí quyết bảo dưỡng xe điện hiệu quả",
    desc: "Các bước bảo dưỡng xe điện giúp tăng tuổi thọ, tiết kiệm chi phí và đảm bảo an toàn khi vận hành.",
  },
  {
    image: "/images/ev3.jpg",
    tag: "Tiết kiệm năng lượng",
    title: "Mẹo sử dụng xe điện tiết kiệm pin",
    desc: "Những mẹo nhỏ giúp bạn sử dụng xe điện tiết kiệm năng lượng, di chuyển xa hơn mỗi lần sạc.",
  },
];

export default function EVGuideCards() {
  return (
    <section className="max-w-7xl mx-auto mt-12 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-gray-500 text-sm">Bạn đã biết chưa?</span>
          <h2 className="text-2xl font-bold text-amber-600">
            Kiến thức hữu ích về xe điện
          </h2>
        </div>
        <button className="border border-black px-5 py-2 rounded-full hover:bg-amber-50 transition">
          Xem thêm
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {guides.map((guide, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col"
          >
            <img
              src={guide.image}
              alt={guide.title}
              className="rounded-lg h-40 w-full object-cover mb-4"
            />
            <span className="bg-amber-100 text-amber-600 text-xs px-3 py-1 rounded-full mb-2 w-fit">
              {guide.tag}
            </span>
            <h3 className="font-semibold text-lg mb-2 text-gray-800">
              {guide.title}
            </h3>
            <p className="text-gray-600 text-sm">{guide.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
