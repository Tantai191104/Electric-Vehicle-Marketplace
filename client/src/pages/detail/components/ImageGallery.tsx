import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface ImageGalleryProps {
    images?: string[];
    brand: string;
    model: string;
    className?: string;
}

export function ImageGallery({ images, brand, model, className = "" }: ImageGalleryProps) {
    const [imgIdx, setImgIdx] = useState(0);
    const displayImages = images && images.length > 0 ? images : ["/car-default.jpg"];

    const handlePrevious = () => {
        setImgIdx(i => (i === 0 ? displayImages.length - 1 : i - 1));
    };

    const handleNext = () => {
        setImgIdx(i => (i === displayImages.length - 1 ? 0 : i + 1));
    };

    return (
        <div className={className}>
            <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img
                    src={displayImages[imgIdx]}
                    alt={`${brand} ${model}`}
                    className="w-full h-[280px] md:h-[320px] object-cover"
                />
                {displayImages.length > 1 && (
                    <>
                        <button
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-black/80 text-gray-700 hover:text-white rounded-full p-2 shadow transition"
                            onClick={handlePrevious}
                            aria-label="Previous image"
                        >
                            <FiChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-black/80 text-gray-700 hover:text-white rounded-full p-2 shadow transition"
                            onClick={handleNext}
                            aria-label="Next image"
                        >
                            <FiChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {displayImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                    {displayImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setImgIdx(idx)}
                            className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${imgIdx === idx ? "border-blue-700 shadow-lg" : "border-gray-200"}`}
                            aria-label={`View image ${idx + 1}`}
                        >
                            <img
                                src={img}
                                alt={`thumb-${idx}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}