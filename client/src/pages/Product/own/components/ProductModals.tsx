import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatVND } from "@/utils/formatVND";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types/productType";

interface ProductDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    loading: boolean;
}

export function ProductDetailModal({ open, onOpenChange, product, loading }: ProductDetailModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Chi tiết sản phẩm</DialogTitle>
                </DialogHeader>
                {loading ? (
                    <div className="py-8 text-center text-gray-500">Đang tải...</div>
                ) : product ? (
                    <div className="space-y-4">
                        <div className="font-bold text-lg text-gray-900">{product.title}</div>
                        <div className="text-xl font-bold text-blue-700">{formatVND(product.price)}</div>
                        <div className="text-sm text-gray-600">{product.description}</div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">{product.category}</span>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">{product.condition}</span>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">Model: {product.model}</span>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">Năm: {product.year}</span>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">Trạng thái: {product.status}</span>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">Ưu tiên: {product.isFeatured ? "Có" : "Không"}</span>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">Lượt xem: {product.views}</span>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">Lượt thích: {product.likes}</span>
                        </div>
                        <div className="text-xs text-gray-500">Ngày đăng: {new Date(product.createdAt).toLocaleString('vi-VN')}</div>
                        <div className="text-xs text-gray-500">Ngày cập nhật: {new Date(product.updatedAt).toLocaleString('vi-VN')}</div>
                        {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt="Ảnh sản phẩm" className="w-full h-48 object-cover rounded" />
                        ) : (
                            <div className="text-xs text-gray-400">Không có ảnh sản phẩm</div>
                        )}
                        {product.brand && (
                            <div className="text-xs text-gray-500">Nhãn hiệu: {product.brand}</div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="font-semibold text-sm mb-1">Thông số kỹ thuật</div>
                                {product.specifications ? (
                                    <ul className="text-xs text-gray-700 list-disc pl-4">
                                        {Object.entries(product.specifications).map(([key, value]) => (
                                            <li key={key}><span className="font-medium">{key}:</span> {value}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-xs text-gray-400">Không có thông số kỹ thuật</div>
                                )}
                            </div>
                            <div>
                                <div className="font-semibold text-sm mb-1">Thông tin người bán</div>
                                {product.seller ? (
                                    <ul className="text-xs text-gray-700 list-disc pl-4">
                                        <li>Họ tên: {product.seller.name}</li>
                                        <li>Email: {product.seller.email}</li>
                                        <li>Điện thoại: {product.seller.phone}</li>
                                        {product.seller.address && (
                                            <li>Địa chỉ: {product.seller.address.houseNumber}, {product.seller.address.ward}, {product.seller.address.district}, {product.seller.address.province}</li>
                                        )}
                                    </ul>
                                ) : (
                                    <div className="text-xs text-gray-400">Không có thông tin người bán</div>
                                )}
                            </div>
                        </div>
                        {product.contractTemplate && (
                            <div>
                                <div className="font-semibold text-sm mb-1 mt-2">Hợp đồng mẫu</div>
                                <div className="border rounded p-2 bg-gray-50 text-xs max-h-40 overflow-auto">
                                    <pre>{product.contractTemplate.htmlContent?.slice(0, 1000) || "Không có hợp đồng"}</pre>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-8 text-center text-gray-500">Không có dữ liệu sản phẩm</div>
                )}
            </DialogContent>
        </Dialog>
    );
}

interface ProductEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    loading: boolean;
    editForm: Partial<Product>;
    setEditForm: React.Dispatch<React.SetStateAction<Partial<Product>>>;
    editLoading: boolean;
    onSubmit: () => void;
}

export function ProductEditModal({ open, onOpenChange, product, loading, editForm, setEditForm, editLoading, onSubmit }: ProductEditModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
                </DialogHeader>
                {loading ? (
                    <div className="py-8 text-center text-gray-500">Đang tải...</div>
                ) : product ? (
                    <form className="space-y-3" onSubmit={e => { e.preventDefault(); onSubmit(); }}>
                        <div>
                            <label className="text-sm font-medium">Tiêu đề</label>
                            <Input
                                value={editForm.title || ""}
                                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Giá</label>
                            <Input
                                type="number"
                                value={editForm.price || 0}
                                onChange={e => setEditForm(f => ({ ...f, price: Number(e.target.value) }))}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Mô tả</label>
                            <Textarea
                                value={editForm.description || ""}
                                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={editLoading} className="bg-blue-600 text-white">
                                {editLoading ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="py-8 text-center text-gray-500">Không có dữ liệu sản phẩm</div>
                )}
            </DialogContent>
        </Dialog>
    );
}
