import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const accessories = [
  {
    id: "A001",
    name: "Bộ sạc nhanh VinFast",
    type: "Phụ kiện",
    desc: "Sạc nhanh cho xe máy điện VinFast",
    price: "1.200.000 VND",
    image: "/images/accessory-charger.jpg",
    badge: "Tặng cáp sạc",
  },
  {
    id: "A002",
    name: "Mũ bảo hiểm xe điện",
    type: "Phụ kiện",
    desc: "Mũ bảo hiểm chuẩn cho xe điện",
    price: "350.000 VND",
    image: "/images/accessory-helmet.jpg",
    badge: "Tặng khăn che nắng",
  },
  {
    id: "A003",
    name: "Khóa chống trộm thông minh",
    type: "Phụ kiện",
    desc: "Khóa chống trộm cho xe máy điện",
    price: "800.000 VND",
    image: "/images/accessory-lock.jpg",
    badge: "Bảo hành 12 tháng",
  },
  {
    id: "A004",
    name: "Bọc yên chống nước",
    type: "Phụ kiện",
    desc: "Bọc yên xe máy điện chống nước",
    price: "150.000 VND",
    image: "/images/accessory-seat.jpg",
    badge: "Tặng khăn lau xe",
  },
  {
    id: "A005",
    name: "Gương chiếu hậu xe điện",
    type: "Phụ kiện",
    desc: "Gương chiếu hậu thay thế",
    price: "200.000 VND",
    image: "/images/accessory-mirror.jpg",
    badge: "Tặng bộ ốc vít",
  },
  {
    id: "A006",
    name: "Bộ đèn LED siêu sáng",
    type: "Phụ kiện",
    desc: "Đèn LED cho xe máy điện",
    price: "400.000 VND",
    image: "/images/accessory-led.jpg",
    badge: "Lắp đặt miễn phí",
  },
  {
    id: "A007",
    name: "Giá đỡ điện thoại xe điện",
    type: "Phụ kiện",
    desc: "Giá đỡ điện thoại chống rung",
    price: "220.000 VND",
    image: "/images/accessory-phoneholder.jpg",
    badge: "Tặng dây buộc",
  },
  {
    id: "A008",
    name: "Bộ tem dán xe điện",
    type: "Phụ kiện",
    desc: "Tem dán trang trí xe điện",
    price: "90.000 VND",
    image: "/images/accessory-sticker.jpg",
    badge: "Tặng decal mini",
  },
];

export default function EVAccessoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-2 py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-yellow-900">
          Phụ kiện xe điện nổi bật
        </h2>
        <Button
          variant="outline"
          className="rounded-full border-black text-black font-semibold px-6 py-2 hover:bg-black hover:text-white transition"
        >
          Xem thêm &rarr;
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {accessories.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden shadow-md hover:shadow-xl transition-all rounded-2xl border border-yellow-100 bg-white"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-40 object-cover rounded-t-2xl"
              loading="lazy"
            />
            <div className="p-4">
              <div className="text-base font-bold text-yellow-900 mb-1 truncate">
                {item.name}
              </div>
              <div className="text-xs text-gray-500 mb-1">
                {item.desc}
              </div>
              <div className="text-xs text-gray-500 mb-1">
                <span className="font-medium text-yellow-700">{item.type}</span>
              </div>
              <div className="text-base font-bold text-yellow-700 mt-2">
                {item.price}
              </div>
              <div className="mt-2">
                <span className="inline-block bg-yellow-100 text-yellow-900 font-semibold px-3 py-1 rounded-full text-xs">
                  {item.badge}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}