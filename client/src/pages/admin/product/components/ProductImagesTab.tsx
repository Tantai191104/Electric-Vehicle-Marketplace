import { Card, CardContent } from "@/components/ui/card";
import { FiPackage } from "react-icons/fi";
import type { Product } from "@/types/productType";

interface Props {
  product: Product;
}

export const ProductImagesTab: React.FC<Props> = ({ product }) => {
  return (
    <Card>
      <CardContent className="p-4">
        {product.images && product.images.length > 0 ? (
          <div className="space-y-4">
            <div className="aspect-video">
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 9).map((image, index) => (
                  <img
                    key={index + 1}
                    src={image}
                    alt={`${product.title} ${index + 2}`}
                    className="aspect-square object-cover rounded border hover:border-blue-300 transition-colors cursor-pointer"
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Không có hình ảnh</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};