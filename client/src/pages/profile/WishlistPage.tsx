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
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const WishlistPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: products = [], isLoading } = useWishlist();
    const removeMutation = useRemoveFromWishlist();
    const addMutation = useAddToWishlist();
    const qc = useQueryClient();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-10">
                {/* Header Section */}
                <div className="mb-10 flex flex-col items-center justify-center">
                    <div className="p-4 rounded-full bg-yellow-100 border border-gray-200 shadow mb-4">
                        <FiHeart className="w-12 h-12 text-yellow-500 drop-shadow-lg" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight text-center">Danh sách yêu thích</h1>
                    <p className="text-lg text-gray-600 text-center max-w-xl">
                        {products.length > 0
                            ? `Bạn có ${products.length} sản phẩm trong danh sách yêu thích`
                            : 'Lưu lại những sản phẩm bạn thích để dễ dàng tìm lại và mua sau này.'}
                    </p>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-100 via-white to-gray-100 border-0 shadow-lg animate-pulse">
                                <div className="aspect-video bg-slate-200" />
                                <div className="p-6 space-y-4">
                                    <div className="h-4 bg-slate-300 rounded w-3/4" />
                                    <div className="h-4 bg-slate-300 rounded w-1/2" />
                                    <div className="h-4 bg-slate-300 rounded w-full" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    /* Empty State */
                    <Card className="border border-gray-200 shadow-lg bg-white rounded-xl">
                        <CardContent className="flex flex-col items-center justify-center py-20 px-6">
                            <div className="w-24 h-24 rounded-full bg-yellow-100 border border-gray-200 flex items-center justify-center mb-8 shadow">
                                <FiHeart className="w-14 h-14 text-yellow-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Danh sách yêu thích trống
                            </h3>
                            <p className="text-lg text-gray-600 text-center mb-8 max-w-md">
                                Khám phá và lưu những sản phẩm bạn yêu thích để dễ dàng tìm lại sau này
                            </p>
                            <Button
                                onClick={() => navigate('/')}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold shadow px-8 py-3 text-lg rounded-full"
                                size="lg"
                            >
                                <FiShoppingBag className="mr-2 h-6 w-6" />
                                Khám phá sản phẩm
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    /* Products Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((p) => (
                            <Card key={p._id} className="group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 bg-white">
                                {/* Image header */}
                                <div
                                    className="relative overflow-hidden rounded-t-2xl cursor-pointer bg-gray-100"
                                    onClick={() => navigate(`/detail/${p._id}`)}
                                >
                                    {p.images && p.images[0] ? (
                                        <img
                                            src={p.images[0]}
                                            alt={p.title}
                                            className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-60 flex items-center justify-center text-gray-400 bg-gray-50">
                                            <FiShoppingBag className="w-20 h-20 opacity-20" />
                                        </div>
                                    )}

                                    {/* Price pill */}
                                    <div className="absolute left-4 bottom-4">
                                        <Badge className="bg-blue-100 text-blue-800 font-bold px-4 py-2 rounded-full shadow text-base border border-blue-300">
                                            {formatVND(p.price)}
                                        </Badge>
                                    </div>

                                    {/* Remove overlay button */}
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="bg-white/90 text-gray-700 hover:text-red-600 shadow-lg border border-gray-200"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <FiTrash2 className="h-5 w-5" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-xl font-bold">Xóa khỏi danh sách yêu thích?</AlertDialogTitle>
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
                                                        className="bg-gradient-to-tr from-yellow-400 via-pink-300 to-red-400 text-white font-bold shadow-lg px-6 py-2 rounded-full text-base"
                                                    >
                                                        Xóa
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>

                                {/* Content */}
                                <CardContent className="bg-white p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-yellow-600 cursor-pointer transition" onClick={() => navigate(`/detail/${p._id}`)}>{p.title}</h3>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge variant="outline" className="text-xs font-semibold border-pink-300 text-pink-600">{p.brand}</Badge>
                                        <Badge variant="outline" className="text-xs font-semibold border-yellow-300 text-yellow-700">{p.model}</Badge>
                                        <Badge variant="outline" className="text-xs font-semibold border-red-300 text-red-600">{p.year}</Badge>
                                    </div>

                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{p.description}</p>

                                    <div className="flex items-center justify-between pt-3 border-t mt-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                {p.seller?.avatar ? <AvatarImage src={p.seller.avatar} /> : <AvatarFallback className="bg-yellow-200 text-yellow-700 font-bold">{p.seller?.name?.[0] ?? 'U'}</AvatarFallback>}
                                            </Avatar>
                                            <div className="text-sm text-gray-800 font-semibold">{p.seller?.name}</div>
                                        </div>

                                        <div className="w-1/2">
                                            <Button onClick={() => navigate(`/detail/${p._id}`)} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-full shadow px-4 py-2">
                                                <FiEye className="mr-2 h-5 w-5" /> Xem chi tiết
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
    );
};

export default WishlistPage;