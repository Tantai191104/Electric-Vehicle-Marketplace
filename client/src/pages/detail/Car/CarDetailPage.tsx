import { useState } from "react";
import { useParams } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiHeart, FiShield, FiZap } from "react-icons/fi";

// Mock data xe điện
const mockCars = [
    {
        id: "1",
        _id: "1",
        name: "Tesla Model 3",
        price: 1200000000,
        images: [
            "/cars/tesla-model3-1.jpg",
            "/cars/tesla-model3-2.jpg",
            "/cars/tesla-model3-3.jpg",
        ],
        range: "500 km",
        batteryCapacity: "82 kWh",
        topSpeed: "261 km/h",
        chargeTime: "8 giờ (0-100%)",
        driveType: "RWD",
        seats: 5,
        colorOptions: ["Red", "White", "Black", "Blue"],
        additionalInfo: "Xe điện hiệu suất cao, thích hợp cho đường dài và đi phố."
    },
    {
        id: "2",
        _id: "2",
        name: "VinFast VF8",
        price: 1300000000,
        images: ["/cars/vf8-1.jpg", "/cars/vf8-2.jpg"],
        range: "460 km",
        batteryCapacity: "90 kWh",
        topSpeed: "200 km/h",
        chargeTime: "7 giờ (0-100%)",
        driveType: "AWD",
        seats: 5,
        colorOptions: ["Silver", "Black", "White"],
        additionalInfo: "SUV điện sang trọng, an toàn, nhiều công nghệ hiện đại."
    },
    {
        id: "3",
        _id: "3",
        name: "Nissan Leaf",
        price: 900000000,
        images: ["/cars/nissan-leaf-1.jpg", "/cars/nissan-leaf-2.jpg"],
        range: "385 km",
        batteryCapacity: "62 kWh",
        topSpeed: "144 km/h",
        chargeTime: "7.5 giờ (0-100%)",
        driveType: "FWD",
        seats: 5,
        colorOptions: ["White", "Gray", "Blue"],
        additionalInfo: "Xe điện phổ thông, tiết kiệm và dễ sử dụng hàng ngày."
    }
];

export default function CarDetail() {
    const { id } = useParams<{ id: string }>();
    const car = mockCars.find(c => c.id === id) || mockCars[0]; // default nếu không có id
    const [imgIdx, setImgIdx] = useState(0);

    const images: string[] = car.images && car.images.length > 0 ? car.images : ["/car-default.jpg"];

    return (
        <div className="max-w-7xl mx-auto mt-18 md:mt-36 bg-back rounded-2xl shadow-lg p-4 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Image gallery */}
                <div>
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                        <img
                            src={images[imgIdx]}
                            alt={car.name}
                            className="w-full h-[340px] object-cover"
                        />
                        {images.length > 1 && (
                            <>
                                <button
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-black/80 text-gray-700 hover:text-white rounded-full p-2 shadow transition"
                                    onClick={() => setImgIdx(i => (i === 0 ? images.length - 1 : i - 1))}
                                >
                                    <FiChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-black/80 text-gray-700 hover:text-white rounded-full p-2 shadow transition"
                                    onClick={() => setImgIdx(i => (i === images.length - 1 ? 0 : i + 1))}
                                >
                                    <FiChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>
                    {/* Thumbnails */}
                    <div className="flex gap-3 mt-4 overflow-x-auto">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setImgIdx(idx)}
                                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${imgIdx === idx ? "border-blue-700 shadow-lg" : "border-gray-200"}`}
                            >
                                <img
                                    src={img}
                                    alt={`thumb-${idx}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                                />
                            </button>
                        ))}
                    </div>
                    {/* Guarantee badges */}
                    <div className="flex gap-3 mt-5 flex-wrap">
                        <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg font-medium text-sm">
                            <FiShield className="text-pink-500" />
                            Bảo hành chính hãng
                        </div>
                        <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg font-medium text-sm">
                            <FiZap className="text-blue-500" />
                            Cam kết thông số chuẩn
                        </div>
                    </div>
                    {/* Share */}
                    <div className="flex items-center gap-3 mt-5">
                        <span className="text-gray-500 font-medium text-sm">Chia sẻ:</span>
                        <a href="#" className="text-gray-500 hover:text-black"><i className="fab fa-facebook-f" /></a>
                        <a href="#" className="text-gray-500 hover:text-black"><i className="fab fa-twitter" /></a>
                        <a href="#" className="text-gray-500 hover:text-black"><i className="fab fa-instagram" /></a>
                        <a href="#" className="text-gray-500 hover:text-black"><i className="fab fa-youtube" /></a>
                    </div>
                </div>

                {/* Right: Info */}
                <div>
                    {/* SKU & Title & Price */}
                    <div className="mb-2">
                        <div className="text-gray-400 text-sm mb-1">SKU #{car._id}</div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{car.name}</h2>
                        <div className="text-xl md:text-2xl font-bold text-blue-900 mt-2">
                            {car.price ? `${car.price.toLocaleString()}₫` : "Liên hệ"}
                        </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-3 mt-3 mb-5">
                        <button className="bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-900 transition-all duration-200 shadow flex items-center gap-2">
                            <FiZap className="w-5 h-5" />
                            Mua ngay
                        </button>
                        <button className="border border-black px-6 py-2 rounded-full font-semibold text-black bg-white hover:bg-gray-100 transition-all duration-200 shadow flex items-center gap-2">
                            <FiHeart className="w-5 h-5" />
                            Yêu thích
                        </button>
                    </div>
                    {/* Info table */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr>
                                    <td className="text-gray-500 py-1">Quãng đường</td>
                                    <td className="text-gray-700 py-1 font-semibold">{car.range}</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-500 py-1">Pin</td>
                                    <td className="text-gray-700 py-1 font-semibold">{car.batteryCapacity}</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-500 py-1">Tốc độ tối đa</td>
                                    <td className="text-gray-700 py-1 font-semibold">{car.topSpeed}</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-500 py-1">Thời gian sạc</td>
                                    <td className="text-gray-700 py-1 font-semibold">{car.chargeTime}</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-500 py-1">Loại dẫn động</td>
                                    <td className="text-gray-700 py-1 font-semibold">{car.driveType}</td>
                                </tr>
                                {car.seats && (
                                    <tr>
                                        <td className="text-gray-500 py-1">Số ghế</td>
                                        <td className="text-gray-700 py-1 font-semibold">{car.seats}</td>
                                    </tr>
                                )}
                                {car.colorOptions && (
                                    <tr>
                                        <td className="text-gray-500 py-1">Màu sắc</td>
                                        <td className="text-gray-700 py-1 font-semibold">{car.colorOptions.join(", ")}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Additional info */}
                    <div className="text-gray-600 text-sm">
                        <span className="font-semibold">Thông tin thêm:</span>
                        <div>{car.additionalInfo}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
