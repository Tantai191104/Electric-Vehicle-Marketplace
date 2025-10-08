import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FiInfo,
  FiImage,
  FiFileText,
  FiTool
} from "react-icons/fi";
import type { Product } from "@/types/productType";

import { ProductOverviewTab } from "./ProductOverviewTab";
import { ProductImagesTab } from "./ProductImagesTab";
import { ProductSpecsTab } from "./ProductSpecsTab";
import { ProductActionButtons } from "./ProductActionButtons";
import { ProductDescriptionTab } from "./ProductDescriptionTab";
import { ProductHeader } from "./ProductHeader";


interface Props {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (productId: string) => void;
  onReject?: (productId: string) => void;
}

export const ProductDetailDialog: React.FC<Props> = ({
  product,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-4xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <ProductHeader product={product} />

        {/* Content Area */}
        <div className="flex-1 min-h-0">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            {/* Tabs Navigation */}
            <TabsList className="grid w-full grid-cols-4 mx-4 mt-3 flex-shrink-0">
              <TabsTrigger value="overview" className="text-xs">
                <FiInfo className="w-4 h-4 mr-1" />
                Tổng quan
              </TabsTrigger>
              <TabsTrigger value="images" className="text-xs">
                <FiImage className="w-4 h-4 mr-1" />
                Hình ảnh
              </TabsTrigger>
              <TabsTrigger value="description" className="text-xs">
                <FiFileText className="w-4 h-4 mr-1" />
                Mô tả
              </TabsTrigger>
              <TabsTrigger value="specs" className="text-xs">
                <FiTool className="w-4 h-4 mr-1" />
                Thông số
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 pb-6">
                  <TabsContent value="overview" className="mt-0 space-y-4">
                    <ProductOverviewTab product={product} />
                  </TabsContent>

                  <TabsContent value="images" className="mt-0">
                    <ProductImagesTab product={product} />
                  </TabsContent>

                  <TabsContent value="description" className="mt-0">
                    <ProductDescriptionTab product={product} />
                  </TabsContent>

                  <TabsContent value="specs" className="mt-0">
                    <ProductSpecsTab product={product} />
                  </TabsContent>
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </div>

        {/* Action Buttons */}
        <ProductActionButtons
          product={product}
          onApprove={onApprove}
          onReject={onReject}
        />
      </DialogContent>
    </Dialog>
  );
};