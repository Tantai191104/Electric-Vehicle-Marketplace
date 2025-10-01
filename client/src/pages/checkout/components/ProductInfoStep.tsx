import type { Product } from '@/types/productType';
import { formatVND } from '@/utils/formatVND';

interface ProductInfoStepProps {
    product: Product;
    quantity: number;
    showQuantity?: boolean;
    className?: string;
}

export const ProductInfoStep: React.FC<ProductInfoStepProps> = ({
    product,
    quantity,
    showQuantity = true,
    className = ""
}) => (
    <div className={className}>
        {/* Product display card */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                    <img
                        src={product.images?.[0] || '/placeholder.jpg'}
                        alt={`${product.brand} ${product.model}`}
                        className="w-24 h-24 rounded-lg object-cover"
                    />
                </div>

                {/* Product Details */}
                <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {product.brand} {product.model}
                    </h4>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-gray-500">Năm sản xuất:</span>
                            <p className="font-medium">{product.year}</p>
                        </div>

                        {showQuantity && (
                            <div>
                                <span className="text-gray-500">Số lượng:</span>
                                <p className="font-medium">{quantity}</p>
                            </div>
                        )}

                        <div className="col-span-2">
                            <span className="text-gray-500">Giá bán:</span>
                            <p className="font-bold text-blue-600 text-lg">{formatVND(product.price)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Description */}
        {product.description && (
            <div>
                <h5 className="font-medium text-gray-900 mb-3">Mô tả sản phẩm</h5>
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{product.description}</p>
                </div>
            </div>
        )}

        {/* Additional info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 text-blue-800">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Thông tin sản phẩm đã được xác minh</span>
            </div>
        </div>
    </div>
);