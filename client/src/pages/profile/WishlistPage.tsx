import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWishlist, useRemoveFromWishlist, useAddToWishlist, wishlistKeys } from "@/hooks/useWishlist";
import type { Product } from "@/types/productType";
import { formatVND } from "@/utils/formatVND";
import { FiTrash2, FiEye, FiHeart, FiShoppingBag } from "react-icons/fi";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import FixedHeader from "@/layouts/components/base/FixedHeader";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const WishlistPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: products = [], isLoading } = useWishlist();
    const removeMutation = useRemoveFromWishlist();
    const addMutation = useAddToWishlist();
    const qc = useQueryClient();

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-gray-50">
            <FixedHeader />
            <div className="min-h-[calc(100vh-120px)] mt-[120px] px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <FiHeart className="w-6 h-6 text-yellow-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Danh sách yêu thích</h1>
                        </div>
                        <p className="text-gray-600 ml-14">
                            {products.length > 0
                                ? `Bạn có ${products.length} sản phẩm trong danh sách yêu thích`
                                : 'Chưa có sản phẩm nào trong danh sách yêu thích'}
                        </p>
                    </div>

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i} className="overflow-hidden bg-slate-900/50 border-slate-800">
                                    <div className="animate-pulse">
                                        <div className="aspect-video bg-slate-800" />
                                        <div className="p-6 space-y-4">
                                            <div className="h-4 bg-slate-800 rounded w-3/4" />
                                            <div className="h-4 bg-slate-800 rounded w-1/2" />
                                            <div className="h-4 bg-slate-800 rounded w-full" />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        /* Empty State */
                        <Card className="border-dashed border-2 border-gray-200 bg-white">
                            <CardContent className="flex flex-col items-center justify-center py-16 px-4">
                                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                                    <FiHeart className="w-10 h-10 text-yellow-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Danh sách yêu thích trống
                                </h3>
                                <p className="text-gray-600 text-center mb-6 max-w-md">
                                    Khám phá và lưu những sản phẩm bạn yêu thích để dễ dàng tìm lại sau này
                                </p>
                                <Button
                                    onClick={() => navigate('/')}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                    size="lg"
                                >
                                    <FiShoppingBag className="mr-2 h-5 w-5" />
                                    Khám phá sản phẩm
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        /* Products Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((p) => (
                                <Card key={p._id} className="group overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition">
                                    {/* Image header */}
                                    <div
                                        className="relative overflow-hidden rounded-t-xl cursor-pointer bg-gray-100"
                                        onClick={() => navigate(`/detail/${p._id}`)}
                                    >
                                        {p.images && p.images[0] ? (
                                            <img
                                                src={p.images[0]}
                                                alt={p.title}
                                                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-56 flex items-center justify-center text-gray-400 bg-gray-50">
                                                <FiShoppingBag className="w-16 h-16 opacity-20" />
                                            </div>
                                        )}

                                        {/* Price pill */}
                                        <div className="absolute left-4 bottom-4">
                                            <Badge className="bg-yellow-500 text-white font-semibold px-3 py-1 rounded-full shadow">{formatVND(p.price)}</Badge>
                                        </div>

                                        {/* Remove overlay button */}
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="bg-white/90 text-gray-700 hover:text-red-600 shadow"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <FiTrash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Xóa khỏi danh sách yêu thích?</AlertDialogTitle>
                                                        <AlertDialogDescription>Bạn có chắc muốn xóa "{p.title}" khỏi danh sách yêu thích không?</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={async () => {
                                                                const id = p._id;
                                                                const prev = qc.getQueryData<Product[]>(wishlistKeys.list()) || [];
                                                                qc.setQueryData(wishlistKeys.list(), prev.filter((x) => x._id !== id));

                                                                toast.success("Đã xóa khỏi yêu thích", {
                                                                    action: {
                                                                        label: "Hoàn tác",
                                                                        onClick: async () => {
                                                                            try {
                                                                                await addMutation.mutateAsync(id);
                                                                                qc.invalidateQueries({ queryKey: wishlistKeys.list() });
                                                                                toast.success("Đã khôi phục vào danh sách yêu thích");
                                                                            } catch (e) {
                                                                                console.error("Undo add failed", e);
                                                                                toast.error("Hoàn tác thất bại");
                                                                            }
                                                                        },
                                                                    },
                                                                });

                                                                try {
                                                                    await removeMutation.mutateAsync(id);
                                                                } catch (e) {
                                                                    qc.setQueryData(wishlistKeys.list(), prev);
                                                                    console.error("Remove wishlist failed", e);
                                                                    toast.error("Xóa thất bại. Vui lòng thử lại.");
                                                                }
                                                            }}
                                                            disabled={removeMutation.status === "pending"}
                                                            className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                                        >
                                                            Xóa
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <CardContent className="bg-white p-5">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2" onClick={() => navigate(`/detail/${p._id}`)}>{p.title}</h3>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Badge variant="outline" className="text-xs">{p.brand}</Badge>
                                            <Badge variant="outline" className="text-xs">{p.model}</Badge>
                                            <Badge variant="outline" className="text-xs">{p.year}</Badge>
                                        </div>

                                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{p.description}</p>

                                        <div className="flex items-center justify-between pt-3 border-t mt-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    {p.seller?.avatar ? <AvatarImage src={p.seller.avatar} /> : <AvatarFallback className="bg-gray-200 text-gray-700">{p.seller?.name?.[0] ?? 'U'}</AvatarFallback>}
                                                </Avatar>
                                                <div className="text-sm text-gray-800">{p.seller?.name}</div>
                                            </div>

                                            <div className="w-1/2">
                                                <Button onClick={() => navigate(`/detail/${p._id}`)} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg">
                                                    <FiEye className="mr-2 h-4 w-4" /> Xem chi tiết
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WishlistPage;