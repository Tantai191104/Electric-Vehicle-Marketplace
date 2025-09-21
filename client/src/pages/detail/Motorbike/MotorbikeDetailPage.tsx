import { useState } from "react";
import { useParams } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiHeart, FiShield, FiZap } from "react-icons/fi";

// Mock data xe máy điện
const mockMotorbikes = [
    {
        id: "1",
        _id: "1",
        name: "VinFast Klara S",
        price: 35000000,
        images: [
            "/motorbikes/klaras-1.jpg",
            "/motorbikes/klaras-2.jpg",
            "/motorbikes/klaras-3.jpg",
        ],
        range: "120 km",
        batteryCapacity: "3.5 kWh",
        topSpeed: "50 km/h",
        chargeTime: "4 giờ (0-100%)",
        driveType: "Bánh sau",
        seats: 2,
        colorOptions: ["Đen", "Trắng", "Đỏ"],
        additionalInfo: "Xe máy điện tiết kiệm, phù hợp di chuyển nội thành, thiết kế hiện đại."
    },
    {
        id: "2",
        _id: "2",
        name: "Yadea G5",
        price: 29000000,
        images: ["/motorbikes/yadeag5-1.jpg", "/motorbikes/yadeag5-2.jpg"],
        range: "100 km",
        batteryCapacity: "2.5 kWh",
        topSpeed: "45 km/h",
        chargeTime: "3.5 giờ (0-100%)",
        driveType: "Bánh sau",
        seats: 2,
        colorOptions: ["Trắng", "Xám", "Đen"],
        additionalInfo: "Thiết kế trẻ trung, động cơ mạnh mẽ, phù hợp cho sinh viên và người trẻ."
    },
    {
        id: "3",
        _id: "3",
        name: "Pega Aura",
        price: 25000000,
        images: ["/motorbikes/pegaaura-1.jpg", "/motorbikes/pegaaura-2.jpg"],
        range: "90 km",
        batteryCapacity: "2.2 kWh",
        topSpeed: "40 km/h",
        chargeTime: "3 giờ (0-100%)",
        driveType: "Bánh sau",
        seats: 2,
        colorOptions: ["Xám", "Trắng"],
        additionalInfo: "Xe máy điện phổ thông, dễ sử dụng, chi phí bảo trì thấp."
    }
];

export default function MotorbikeDetailPage() {
    const { id } = useParams<{ id: string }>();
    const bike = mockMotorbikes.find(b => b.id === id) || mockMotorbikes[0];
    const [imgIdx, setImgIdx] = useState(0);

    const images: string[] = bike.images && bike.images.length > 0 ? bike.images : ["/motorbike-default.jpg"];

    return (
        <div className="max-w-7xl mx-auto mt-18 md:mt-36 bg-back rounded-2xl shadow-lg p-4 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Image gallery */}
                <div>
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                        <img
                            src={images[imgIdx]}
                            alt={bike.name}
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
                                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${imgIdx === idx ? "border-yellow-500 shadow-lg" : "border-gray-200"}`}
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
                        <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg font-medium text-sm">
                            <FiShield className="text-yellow-500" />
                            Bảo hành chính hãng
                        </div>
                        <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg font-medium text-sm">
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
                        <div className="text-gray-400 text-sm mb-1">SKU #{bike._id}</div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{bike.name}</h2>
                        <div className="text-xl md:text-2xl font-bold text-yellow-700 mt-2">
                            {bike.price ? `${bike.price.toLocaleString()}₫` : "Liên hệ"}
                        </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-3 mt-3 mb-5">
                        <button className="bg-yellow-400 text-black px-6 py-2 rounded-full font-semibold hover:bg-yellow-500 transition-all duration-200 shadow flex items-center gap-2">
                            <FiZap className="w-5 h-5" />
                            Mua ngay
                        </button>
                        <button className="border border-yellow-400 px-6 py-2 rounded-full font-semibold text-yellow-700 bg-white hover:bg-yellow-50 transition-all duration-200 shadow flex items-center gap-2">
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
                                    <td className="text-gray-700 py-1 font-semibold">{bike.range}</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-500 py-1">Pin</td>
                                    <td className="text-gray-700 py-1 font-semibold">{bike.batteryCapacity}</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-500 py-1">Tốc độ tối đa</td>
                                    <td className="text-gray-700 py-1 font-semibold">{bike.topSpeed}</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-500 py-1">Thời gian sạc</td>
                                    <td className="text-gray-700 py-1 font-semibold">{bike.chargeTime}</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-500 py-1">Loại dẫn động</td>
                                    <td className="text-gray-700 py-1 font-semibold">{bike.driveType}</td>
                                </tr>
                                {bike.seats && (
                                    <tr>
                                        <td className="text-gray-500 py-1">Số ghế</td>
                                        <td className="text-gray-700 py-1 font-semibold">{bike.seats}</td>
                                    </tr>
                                )}
                                {bike.colorOptions && (
                                    <tr>
                                        <td className="text-gray-500 py-1">Màu sắc</td>
                                        <td className="text-gray-700 py-1 font-semibold">{bike.colorOptions.join(", ")}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Additional info */}
                    <div className="text-gray-600 text-sm">
                        <span className="font-semibold">Thông tin thêm:</span>
                        <div>{bike.additionalInfo}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}