import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const products = [
  {
    id: "EV001",
    name: "VinFast Feliz S",
    image: "/images/feliz.jpg",
    price: "18.000.000 VND",
    type: "Xe máy điện",
    year: "2023",
    status: "Đã sử dụng",
  },
  {
    id: "EV002",
    name: "VinFast Klara",
    image: "/images/klara.jpg",
    price: "15.500.000 VND",
    type: "Xe máy điện",
    year: "2022",
    status: "Đã sử dụng",
  },
  {
    id: "EV003",
    name: "VinFast VF e34",
    image: "/images/vfe34.jpg",
    price: "420.000.000 VND",
    type: "Ô tô điện",
    year: "2022",
    status: "Đã sử dụng",
  },
  {
    id: "EV004",
    name: "Pega NewTech",
    image: "/images/pega.jpg",
    price: "12.000.000 VND",
    type: "Xe máy điện",
    year: "2021",
    status: "Đã sử dụng",
  },
  {
    id: "EV005",
    name: "VinFast VF 5 Plus",
    image: "/images/vf5.jpg",
    price: "320.000.000 VND",
    type: "Ô tô điện",
    year: "2023",
    status: "Đã sử dụng",
  },
  {
    id: "EV006",
    name: "Yadea G5",
    image: "/images/yadea.jpg",
    price: "16.000.000 VND",
    type: "Xe máy điện",
    year: "2022",
    status: "Đã sử dụng",
  },
  {
    id: "EV007",
    name: "VinFast Ludo",
    image: "/images/ludo.jpg",
    price: "10.500.000 VND",
    type: "Xe máy điện",
    year: "2021",
    status: "Đã sử dụng",
  },
  {
    id: "EV008",
    name: "VinFast VF 8",
    image: "/images/vf8.jpg",
    price: "850.000.000 VND",
    type: "Ô tô điện",
    year: "2023",
    status: "Đã sử dụng",
  },
];

export default function EVProductGrid() {
  return (
    <section className="max-w-7xl mx-auto px-2 py-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-yellow-900">
            Khám phá xe điện nổi bật
          </h2>
        </div>
        <Button
          asChild
          variant="outline"
          className="rounded-full border-black text-black font-semibold px-6 py-2 hover:bg-black hover:text-white transition"
        >
          <Link to="/cars">Xem thêm &rarr;</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden shadow-md hover:shadow-xl transition-all rounded-2xl border border-yellow-100 bg-white group"
          >
            <CardHeader className="p-0 relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-md shadow">
                {product.status}
              </span>
            </CardHeader>
            <CardContent className="p-4 flex flex-col justify-between">
              <div>
                <CardTitle className="text-base font-bold text-yellow-900 mb-1 line-clamp-1">
                  {product.id} - {product.name}
                </CardTitle>
                <div className="text-xs text-gray-500 mb-1 flex flex-wrap gap-x-2">
                  <span className="font-medium text-gray-700">
                    {product.type}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="font-medium text-gray-700">
                    {product.year}
                  </span>
                </div>
                <div className="text-base font-bold text-yellow-700 mt-2">
                  {product.price}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
