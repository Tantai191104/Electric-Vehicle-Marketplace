import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/types/productType";

interface Props {
    product: Product;
}

export const ProductDescriptionTab: React.FC<Props> = ({ product }) => {
    return (
        <Card>
            <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Mô tả sản phẩm</h3>
                <div className="flex justify-center">
                    <div
                        className="
              bg-gray-50 p-4 rounded border 
              text-gray-700 leading-relaxed text-sm 
              whitespace-pre-wrap break-words 
              max-w-2xl w-full
            "
                    >
                        {product.description || "Không có mô tả"}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
