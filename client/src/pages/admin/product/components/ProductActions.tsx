import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FiMoreVertical, FiEye, FiStar } from "react-icons/fi";
import type { Product } from "@/types/productType";

interface Props {
    product: Product;
    onView: (product: Product) => void;
    onToggleFeatured: (productId: string, featured: boolean) => void;
}

export const ProductActions: React.FC<Props> = ({
    product,
    onView,
    onToggleFeatured,
}) => {
    const [isOpen, setIsOpen] = useState(false);


    const handleToggleFeatured = () => {
        onToggleFeatured(product._id, !product.isFeatured);
        setIsOpen(false);
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                    <FiMoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onView(product)}>
                    <FiEye className="w-4 h-4 mr-2" />
                    Xem chi tiết
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleToggleFeatured}>
                    {product.isFeatured ? (
                        <>
                            <FiStar className="w-4 h-4 mr-2 text-gray-400" />
                            Bỏ nổi bật
                        </>
                    ) : (
                        <>
                            <FiStar className="w-4 h-4 mr-2 text-yellow-500" />
                            Đặt nổi bật
                        </>
                    )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

            </DropdownMenuContent>
        </DropdownMenu>
    );
};