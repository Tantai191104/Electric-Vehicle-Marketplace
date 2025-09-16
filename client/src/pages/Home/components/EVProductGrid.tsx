import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-2 max-w-7xl mx-auto">
      {products.map((product) => (
        <Card
          key={product.id}
          className="overflow-hidden shadow-sm hover:shadow-xl transition-all rounded-xl border border-yellow-100 bg-white"
        >
          <CardHeader className="p-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-cover rounded-t-xl"
              loading="lazy"
            />
          </CardHeader>
          <CardContent className="p-3">
            <CardTitle className="text-sm font-bold text-yellow-900 mb-1 truncate">
              {product.id} - {product.name}
            </CardTitle>
            <div className="text-xs text-gray-500 mb-1 flex flex-wrap gap-x-2">
              <span className="font-medium text-gray-700">{product.type}</span>
              <span className="text-gray-300">|</span>
              <span className="font-medium text-gray-700">{product.year}</span>
            </div>
            <div className="text-xs text-gray-500 mb-1">
              <span className="font-medium text-yellow-700">{product.status}</span>
            </div>
            <div className="text-base font-bold text-yellow-700 mt-2">{product.price}</div>
            <Button
              size="sm"
              className="w-full mt-3 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-semibold rounded-lg"
            >
              Xem chi tiết
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}