import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FiMoreVertical, FiEye, FiCheckCircle, FiXCircle } from "react-icons/fi";
import type { Product } from "@/types/productType";

type Props = {
    product: Product;
    onView: (product: Product) => void;
    onApprove?: (productId: string) => void;
    onReject?: (productId: string) => void;
};
export const ProductActions: React.FC<Props> = ({ product, onView, onApprove, onReject }) => {
    const [isOpen, setIsOpen] = useState(false);


    const handleApprove = () => {
        if (onApprove) onApprove(product._id);
        setIsOpen(false);
    };
    const handleReject = () => {
        if (onReject) onReject(product._id);
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

                {product.status === "pending" && (
                    <>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={handleApprove}>
                            <FiCheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            Duyệt
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleReject}>
                            <FiXCircle className="w-4 h-4 mr-2 text-red-600" />
                            Từ chối
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};