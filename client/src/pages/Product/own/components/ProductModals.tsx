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
        <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
            <DialogContent className="!max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chi tiết sản phẩm</DialogTitle>
                </DialogHeader>
                {loading ? (
                    <div className="py-8 text-center text-gray-500">Đang tải...</div>
                ) : product ? (
                    <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                        {/* Hình ảnh sản phẩm */}
                        {product.images && product.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                                {product.images.slice(0, 4).map((img, idx) => (
                                    <img key={idx} src={img} alt={`Ảnh sản phẩm ${idx + 1}`} className="w-full h-40 object-cover rounded-lg" />
                                ))}
                            </div>
                        )}

                        {/* Tiêu đề và giá */}
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 mb-2">{product.title}</h2>
                            <div className="text-3xl font-bold text-blue-700">{formatVND(product.price)}</div>
                        </div>

                        {/* Thông tin cơ bản */}
                        <div className="border-t pt-4">
                            <h3 className="font-semibold text-base mb-3 text-gray-900">Thông tin cơ bản</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Danh mục:</span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                                        {product.category === "vehicle" ? "Xe điện" : product.category === "battery" ? "Pin" : "Phụ kiện"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Tình trạng:</span>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">
                                        {product.condition === "new" ? "Mới" : product.condition === "used" ? "Đã sử dụng" : "Tân trang"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Thương hiệu:</span>
                                    <span className="text-sm font-medium text-gray-900">{product.brand || "Chưa có"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Model:</span>
                                    <span className="text-sm font-medium text-gray-900">{product.model || "Chưa có"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Năm sản xuất:</span>
                                    <span className="text-sm font-medium text-gray-900">{product.year}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Trạng thái:</span>
                                    <span className={`px-2 py-1 rounded text-sm font-medium ${product.status === "active" ? "bg-green-100 text-green-700" :
                                        product.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                            product.status === "sold" ? "bg-blue-100 text-blue-700" :
                                                "bg-gray-100 text-gray-700"
                                        }`}>
                                        {product.status === "active" ? "Đang hiển thị" :
                                            product.status === "pending" ? "Chờ duyệt" :
                                                product.status === "sold" ? "Đã bán" : product.status}
                                    </span>
                                </div>
                                {product.isFeatured && (
                                    <div className="col-span-2 flex items-center gap-2">
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">⭐ Sản phẩm nổi bật</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mô tả */}
                        <div className="border-t pt-4">
                            <h3 className="font-semibold text-base mb-2 text-gray-900">Mô tả chi tiết</h3>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description || "Không có mô tả"}</p>
                        </div>

                        {/* Kích thước (nếu có) */}
                        {(product.length || product.width || product.height || product.weight) && (
                            <div className="border-t pt-4">
                                <h3 className="font-semibold text-base mb-3 text-gray-900">Kích thước & Trọng lượng</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {product.length && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">Dài:</span>
                                            <span className="text-sm font-medium text-gray-900">{product.length} cm</span>
                                        </div>
                                    )}
                                    {product.width && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">Rộng:</span>
                                            <span className="text-sm font-medium text-gray-900">{product.width} cm</span>
                                        </div>
                                    )}
                                    {product.height && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">Cao:</span>
                                            <span className="text-sm font-medium text-gray-900">{product.height} cm</span>
                                        </div>
                                    )}
                                    {product.weight && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">Cân nặng:</span>
                                            <span className="text-sm font-medium text-gray-900">{product.weight} kg</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Thông số kỹ thuật */}
                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                            <div className="border-t pt-4">
                                <h3 className="font-semibold text-base mb-3 text-gray-900">Thông số kỹ thuật</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Pin - Battery specifications */}
                                    {product.category === "battery" && (
                                        <>
                                            {product.specifications.voltage && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-gray-500">Điện áp</span>
                                                    <span className="text-sm font-semibold text-gray-900">{product.specifications.voltage} V</span>
                                                </div>
                                            )}
                                            {product.specifications.capacity && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-gray-500">Dung lượng</span>
                                                    <span className="text-sm font-semibold text-gray-900">{product.specifications.capacity} Ah</span>
                                                </div>
                                            )}
                                            {product.specifications.batteryType && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-gray-500">Loại pin</span>
                                                    <span className="text-sm font-semibold text-gray-900">{product.specifications.batteryType}</span>
                                                </div>
                                            )}
                                            {product.specifications.warranty && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-gray-500">Bảo hành</span>
                                                    <span className="text-sm font-semibold text-gray-900">{product.specifications.warranty} tháng</span>
                                                </div>
                                            )}
                                            {product.specifications.cycleLife && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-gray-500">Chu kỳ sạc</span>
                                                    <span className="text-sm font-semibold text-gray-900">{product.specifications.cycleLife} lần</span>
                                                </div>
                                            )}
                                            {product.specifications.chargingTime && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-gray-500">Thời gian sạc</span>
                                                    <span className="text-sm font-semibold text-gray-900">{product.specifications.chargingTime}</span>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Xe điện - Vehicle specifications */}
                                    {product.category === "vehicle" && (
                                        <>
                                            {product.specifications.topSpeed && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-gray-500">Tốc độ tối đa</span>
                                                    <span className="text-sm font-semibold text-gray-900">{product.specifications.topSpeed} km/h</span>
                                                </div>
                                            )}
                                            {product.specifications.range && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-gray-500">Quãng đường</span>
                                                    <span className="text-sm font-semibold text-gray-900">{product.specifications.range} km</span>
                                                </div>
                                            )}
                                            {product.specifications.batteryCapacity && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-gray-500">Dung lượng pin</span>
                                                    <span className="text-sm font-semibold text-gray-900">{product.specifications.batteryCapacity} Ah</span>
                                                </div>
                                            )}
                                            {product.specifications.motorPower && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-gray-500">Công suất động cơ</span>
                                                    <span className="text-sm font-semibold text-gray-900">{product.specifications.motorPower} W</span>
                                                </div>
                                            )}
                                            {product.specifications.chargingTime && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-gray-500">Thời gian sạc</span>
                                                    <span className="text-sm font-semibold text-gray-900">{product.specifications.chargingTime}</span>
                                                </div>
                                            )}
                                            {product.specifications.warranty && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-gray-500">Bảo hành</span>
                                                    <span className="text-sm font-semibold text-gray-900">{product.specifications.warranty} tháng</span>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Phụ kiện và các loại khác - Other specifications */}
                                    {product.category !== "battery" && product.category !== "vehicle" && (
                                        <>
                                            {Object.entries(product.specifications).map(([key, value]) => (
                                                value && (
                                                    <div key={key} className="flex flex-col gap-1">
                                                        <span className="text-xs text-gray-500">{key}</span>
                                                        <span className="text-sm font-semibold text-gray-900">{value}</span>
                                                    </div>
                                                )
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Thông tin người bán */}
                        {product.seller && (
                            <div className="border-t pt-4">
                                <h3 className="font-semibold text-base mb-3 text-gray-900">Thông tin người bán</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Họ tên:</span>
                                        <span className="text-sm font-medium text-gray-900">{product.seller.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Email:</span>
                                        <span className="text-sm font-medium text-gray-900">{product.seller.email}</span>
                                    </div>
                                    {product.seller.phone && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">Điện thoại:</span>
                                            <span className="text-sm font-medium text-gray-900">{product.seller.phone}</span>
                                        </div>
                                    )}
                                    {product.seller.address && (
                                        <div className="flex items-start gap-2">
                                            <span className="text-sm text-gray-500">Địa chỉ:</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {product.seller.address.houseNumber}, {product.seller.address.ward}, {product.seller.address.district}, {product.seller.address.province}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Thống kê */}
                        <div className="border-t pt-4">
                            <h3 className="font-semibold text-base mb-3 text-gray-900">Thống kê</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Lượt xem:</span>
                                    <span className="text-sm font-medium text-gray-900">{product.views || 0}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Lượt thích:</span>
                                    <span className="text-sm font-medium text-gray-900">{product.likes || 0}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Ngày đăng:</span>
                                    <span className="text-sm font-medium text-gray-900">{new Date(product.createdAt).toLocaleString('vi-VN')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Cập nhật:</span>
                                    <span className="text-sm font-medium text-gray-900">{new Date(product.updatedAt).toLocaleString('vi-VN')}</span>
                                </div>
                            </div>
                        </div>
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
            <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
                </DialogHeader>
                {loading ? (
                    <div className="py-8 text-center text-gray-500">Đang tải...</div>
                ) : product ? (
                    <form className="space-y-3 overflow-y-auto flex-1 pr-2" onSubmit={e => { e.preventDefault(); onSubmit(); }}>
                        {/* Thông tin hiện tại */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <h4 className="font-semibold text-sm text-blue-900 mb-2">Thông tin hiện tại</h4>
                            <div className="space-y-1 text-xs text-blue-800">
                                <div className="flex justify-between">
                                    <span className="text-blue-600">Danh mục:</span>
                                    <span className="font-medium">{product.category === "vehicle" ? "Xe điện" : product.category === "battery" ? "Pin" : "Phụ kiện"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-600">Tình trạng:</span>
                                    <span className="font-medium">{product.condition === "new" ? "Mới" : product.condition === "used" ? "Đã sử dụng" : "Tân trang"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-600">Thương hiệu:</span>
                                    <span className="font-medium">{product.brand || "Chưa có"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-600">Model:</span>
                                    <span className="font-medium">{product.model || "Chưa có"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-600">Năm:</span>
                                    <span className="font-medium">{product.year}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-600">Trạng thái:</span>
                                    <span className={`font-medium ${product.status === "active" ? "text-green-700" : product.status === "pending" ? "text-yellow-700" : "text-gray-700"}`}>
                                        {product.status === "active" ? "Đang hiển thị" : product.status === "pending" ? "Chờ duyệt" : product.status === "sold" ? "Đã bán" : product.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Thông số kỹ thuật */}
                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                                <h4 className="font-semibold text-sm text-gray-900 mb-2">Thông số kỹ thuật</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {product.category === "battery" && (
                                        <>
                                            {product.specifications.voltage && (
                                                <div className="flex flex-col">
                                                    <span className="text-gray-500">Điện áp</span>
                                                    <span className="font-semibold text-gray-900">{product.specifications.voltage} V</span>
                                                </div>
                                            )}
                                            {product.specifications.capacity && (
                                                <div className="flex flex-col">
                                                    <span className="text-gray-500">Dung lượng</span>
                                                    <span className="font-semibold text-gray-900">{product.specifications.capacity} Ah</span>
                                                </div>
                                            )}
                                            {product.specifications.batteryType && (
                                                <div className="flex flex-col">
                                                    <span className="text-gray-500">Loại pin</span>
                                                    <span className="font-semibold text-gray-900">{product.specifications.batteryType}</span>
                                                </div>
                                            )}
                                            {product.specifications.warranty && (
                                                <div className="flex flex-col">
                                                    <span className="text-gray-500">Bảo hành</span>
                                                    <span className="font-semibold text-gray-900">{product.specifications.warranty} tháng</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {product.category === "vehicle" && (
                                        <>
                                            {product.specifications.topSpeed && (
                                                <div className="flex flex-col">
                                                    <span className="text-gray-500">Tốc độ tối đa</span>
                                                    <span className="font-semibold text-gray-900">{product.specifications.topSpeed} km/h</span>
                                                </div>
                                            )}
                                            {product.specifications.range && (
                                                <div className="flex flex-col">
                                                    <span className="text-gray-500">Quãng đường</span>
                                                    <span className="font-semibold text-gray-900">{product.specifications.range} km</span>
                                                </div>
                                            )}
                                            {product.specifications.motorPower && (
                                                <div className="flex flex-col">
                                                    <span className="text-gray-500">Công suất động cơ</span>
                                                    <span className="font-semibold text-gray-900">{product.specifications.motorPower} W</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Form chỉnh sửa */}
                        <div className="border-t pt-3 mt-3">
                            <h4 className="font-semibold text-sm text-gray-900 mb-3">Chỉnh sửa thông tin</h4>
                            <div className="space-y-3">
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
                                        rows={8}
                                    />
                                </div>
                            </div>
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
