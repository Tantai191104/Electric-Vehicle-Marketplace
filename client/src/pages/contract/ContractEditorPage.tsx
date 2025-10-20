import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import ContractTemplate from "./ContractTemplate.tsx";
import type { ContractInfo } from "@/types/contractTypes";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { exportToPDF } from "@/utils/pdfExport";
import SignatureCanvas from "react-signature-canvas";
import { contractServices } from "@/services/contractServices";
import type { ContractData } from "@/types/contractTypes";
import type { Product } from "@/types/productType";
import numberToVietnameseWords from "@/utils/numberToWords";

type RouteState = {
    product?: Product;
    seller?: Product['seller'];
    contract?: ContractData;
    contractId?: string;
};

export default function ContractEditorPage() {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { state } = location;
    const routeState = (state as RouteState) || undefined;
    const contractIdParam: string | undefined = (params.contractId as string) || routeState?.contractId || routeState?.contract?.contractId;

    const [contract, setContract] = useState<ContractData | null>(routeState?.contract || null);
    const [terms, setTerms] = useState<Array<{ title: string; content: string }>>([]);
    const [loading, setLoading] = useState(false);
    const buyerSigRef = useRef<SignatureCanvas>(null) as React.RefObject<SignatureCanvas>;

    useEffect(() => {
        let mounted = true;
        (async () => {
            // If contract already provided via state, use it
            if (contract) {
                setTerms(contract.template?.terms || []);
                return;
            }

            // If a contractId param provided, we currently don't have an API to GET, so skip
            // Instead, if product info was passed in `state`, initialize via createContract
            const productFromState = routeState?.product;
            const sellerFromState = routeState?.seller;
            if (!productFromState) return;

            if (!productFromState._id) return;
            setLoading(true);
            try {
                // call initiate to get template and contract draft
                if (!sellerFromState?._id) {
                    console.warn('Seller id missing in route state; cannot initiate contract');
                    toast.error('Không có thông tin người bán để khởi tạo hợp đồng');
                    return;
                }
                const resp = await contractServices.createContract({ product_id: productFromState._id, seller_id: sellerFromState._id });
                const data = resp?.data || resp;
                if (!mounted) return;
                setContract(data);
                setTerms(data?.template?.terms || []);
            } catch (err) {
                console.error("Failed to initiate contract", err);
                toast.error("Không thể khởi tạo hợp đồng");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [contractIdParam, contract, routeState]);

    const addTerm = () => setTerms([...terms, { title: "", content: "" }]);
    const updateTerm = (i: number, key: "title" | "content", value: string) => {
        const copy = [...terms];
        copy[i] = { ...copy[i], [key]: value };
        setTerms(copy);
    };
    const removeTerm = (i: number) => setTerms(terms.filter((_, idx) => idx !== i));

    const handleSave = async () => {
        // No server-side update API available; we keep edits locally and show success
        if (!contract) return toast.error("Không có hợp đồng để lưu");
        setContract((prev) => prev ? ({ ...prev, template: { ...prev.template, terms } } as ContractData) : prev);
        toast.success("Lưu thay đổi tạm thời (chưa upload)");
    };

    const handleExportAndUpload = async () => {
        if (!contract || !contract.contractId) return toast.error("Không có hợp đồng để xuất");
        try {
            toast.loading('Đang tạo PDF...', { id: 'export' });
            // create a temp container of ContractTemplate DOM
            const temp = document.createElement('div');
            temp.style.width = '794px';
            temp.style.background = 'white';
            document.body.appendChild(temp);
            // render ContractTemplate into temp using server-side terms + edited terms
            // For simplicity we will clone existing contract DOM if present
            if (document.querySelector('[data-contract-number]')) {
                const node = document.querySelector('[data-contract-number]')?.closest('div');
                if (node) temp.appendChild(node.cloneNode(true) as Node);
            }

            const blob = await exportToPDF({ element: temp as HTMLElement, returnBlob: true });
            toast.dismiss('export');
            if (blob) {
                const file = new File([blob], `hop-dong-${contract.contractId}.pdf`, { type: 'application/pdf' });
                toast.loading('Đang upload PDF...', { id: 'upload' });
                await contractServices.signContract(contract.contractId, file, window.location.href);
                toast.dismiss('upload');
                toast.success('Hợp đồng đã được upload thành công');
            }
            if (document.body.contains(temp)) document.body.removeChild(temp);
        } catch (err) {
            console.error(err);
            toast.dismiss('export');
            toast.error('Xuất hoặc upload thất bại');
        }
    };

    if (!contract) {
        return (
            <div className="min-h-screen p-12">
                <div className="max-w-3xl mx-auto">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <p>Không tìm thấy hợp đồng. Hãy truyền `contractId` vào URL hoặc tạo hợp đồng trước.</p>
                            <div className="mt-4">
                                <Button onClick={() => navigate(-1)}>Quay lại</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-12 bg-gray-50">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Chỉnh sửa hợp đồng</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => navigate(-1)}>Hủy</Button>
                        <Button onClick={handleSave} disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</Button>
                        <Button onClick={handleExportAndUpload} disabled={loading}>Xuất & Upload</Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <ContractTemplate
                            contractData={(function buildContractInfo(): ContractInfo {
                                const product = routeState?.product;
                                const contractNumber = contract?.contractId ? `HD${contract.contractId}` : '';
                                const sellerParty = {
                                    name: contract?.seller?.name || product?.seller?.name || '',
                                    idNumber: contract?.seller?.id || product?.seller?._id || '',
                                } as ContractInfo['seller'];
                                const buyerParty = {
                                    name: contract?.buyer?.name || '',
                                    idNumber: contract?.buyer?.id || '',
                                } as ContractInfo['buyer'];
                                const vehicle = {
                                    name: product ? `${product.brand} ${product.model}` : (contract?.template?.placeholders?.productTitle as string) || '',
                                    plateNumber: product?.specifications?.plateNumber || '',
                                } as ContractInfo['vehicle'];
                                const price = product?.price || 0;
                                return {
                                    contractNumber,
                                    seller: sellerParty,
                                    buyer: buyerParty,
                                    vehicle,
                                    price,
                                    priceInWords: price ? numberToVietnameseWords(price) : '',
                                    signDate: new Date().toLocaleDateString('vi-VN'),
                                };
                            })()}
                            signerSigRef={buyerSigRef}
                            onClearSignature={() => { if (buyerSigRef.current) buyerSigRef.current.clear(); }}
                            serverTerms={contract.template?.terms}
                            extraTerms={terms}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <h2 className="font-semibold mb-4">Điều khoản bổ sung</h2>
                        {terms.map((t, i) => (
                            <div key={i} className="mb-3 grid grid-cols-12 gap-2 items-start">
                                <div className="col-span-3">
                                    <Input value={t.title} onChange={(e) => updateTerm(i, 'title', e.target.value)} placeholder="Tiêu đề" />
                                </div>
                                <div className="col-span-8">
                                    <Textarea value={t.content} onChange={(e) => updateTerm(i, 'content', e.target.value)} placeholder="Nội dung" />
                                </div>
                                <div className="col-span-1">
                                    <Button variant="ghost" onClick={() => removeTerm(i)}>Xóa</Button>
                                </div>
                            </div>
                        ))}
                        <div className="flex gap-2">
                            <Button onClick={addTerm}>Thêm điều khoản</Button>
                            <Button variant="ghost" onClick={() => setTerms(contract.template?.terms || [])}>Khôi phục mẫu</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
