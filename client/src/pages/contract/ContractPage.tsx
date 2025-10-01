import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FiDownload, FiFileText, FiLoader } from "react-icons/fi";

import { exportToPDF } from "@/utils/pdfExport";
import { replaceSignatureCanvasWithImages, clearSignature } from "@/utils/signatureHandler";
import { ContractTemplate } from "./ContractTemplate";
import { contractServices } from "@/services/contractServices";
import type { ContractInfo } from "@/types/contractTypes";
import numberToVietnameseWords from "@/utils/numberToWords";

export default function ContractPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const contractRef = useRef<HTMLDivElement>(null);
    const buyerSigRef = useRef<SignatureCanvas>(null) as React.RefObject<SignatureCanvas>;

    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const [contractId, setContractId] = useState<string | null>(null);

    const { product, buyer, seller } = state || {};

    if (!product || !buyer || !seller) {
        return (
            <div className="pt-32 text-center">
                <p className="text-red-600 font-semibold">Không tìm thấy dữ liệu hợp đồng</p>
                <Button onClick={() => navigate(-1)}>Quay lại</Button>
            </div>
        );
    }
    console.log("ContractPage state:", product, buyer, seller);
    const contractData: ContractInfo = {
        contractNumber: `HD${new Date().getFullYear()}${String(
            Math.floor(Math.random() * 10000)
        ).padStart(4, "0")}`,
        seller,
        buyer,
        vehicle: {
            name: `${product.brand} ${product.model}`,
            plateNumber: product.plateNumber || "Chưa có biển số",
            year: product.year,
            brand: product.brand,
            model: product.model,
        },
        price: product.price,
        priceInWords: numberToVietnameseWords(product.price),
        signDate: new Date().toLocaleDateString("vi-VN"),
    };

    const handleExportPDF = async () => {
        if (!contractRef.current) {
            setExportError("Không tìm thấy nội dung hợp đồng");
            return;
        }

        // Kiểm tra chữ ký
        if (!buyerSigRef.current || buyerSigRef.current.isEmpty()) {
            setExportError("Vui lòng ký tên trước khi xuất PDF");
            return;
        }

        setIsExporting(true);
        setExportError(null);

        try {
            // Bước 1: Tạo contract trong database
            console.log("Đang tạo contract...");
            const contractResponse = await contractServices.createContract({
                product_id: product._id,
                seller_id: seller.idNumber,
            });

            const newContractId = contractResponse.data.contractId;
            setContractId(newContractId);
            console.log("Contract đã tạo với ID:", newContractId);

            // Bước 3: Tạo PDF với contract ID mới
            const clonedElement = contractRef.current.cloneNode(true) as HTMLDivElement;

            // Cập nhật contract number trong DOM clone
            const contractNumberElement = clonedElement.querySelector('[data-contract-number]');
            if (contractNumberElement) {
                contractNumberElement.textContent = `Số hợp đồng: HD${newContractId}`;
            }

            const tempContainer = document.createElement("div");
            tempContainer.style.cssText = `
                position: absolute;
                left: -9999px;
                top: 0;
                width: 794px;
                background: white;
                font-family: Arial, sans-serif;
                color: black;
                line-height: 1.6;
                padding: 40px;
                box-sizing: border-box;
            `;

            tempContainer.appendChild(clonedElement);
            document.body.appendChild(tempContainer);

            await replaceSignatureCanvasWithImages(clonedElement, { signer: buyerSigRef });
            await new Promise((resolve) => setTimeout(resolve, 200));

            const pdfBlob = await exportToPDF({
                element: tempContainer,
                filename: `hop-dong-${newContractId}.pdf`,
                quality: 0.95,
                scale: 2,
            });

            document.body.removeChild(tempContainer);

            // Bước 4: Upload PDF lên server
            if (pdfBlob !== undefined && pdfBlob !== null) {
                console.log("Đang upload PDF lên server...");
                const pdfFile = new File([pdfBlob], `hop-dong-${newContractId}.pdf`, {
                    type: 'application/pdf'
                });

                const uploadResponse = await contractServices.signContract(
                    newContractId,
                    pdfFile,
                    window.location.href // finalUrl - URL trang hiện tại
                );

                console.log("Upload thành công:", uploadResponse);

                // Bước 5: Download PDF cho user
                const url = window.URL.createObjectURL(pdfBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `hop-dong-${newContractId}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                // Hiển thị thông báo thành công
                alert(`Hợp đồng đã được tạo và lưu thành công! ID: ${newContractId}`);

                // Chuyển hướng về trang chính hoặc trang contracts
                // navigate('/contracts'); // Uncomment nếu có trang danh sách contracts
            }

        } catch (err) {
            console.error("Lỗi trong quá trình xử lý:", err);

            if (err instanceof Error) {
                if (err.message.includes('network') || err.message.includes('fetch')) {
                    setExportError("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.");
                } else if (err.message.includes('403') || err.message.includes('401')) {
                    setExportError("Không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại.");
                } else {
                    setExportError(`Lỗi: ${err.message}`);
                }
            } else {
                setExportError("Có lỗi xảy ra trong quá trình tạo hợp đồng");
            }
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto pt-32 pb-6 px-6 space-y-6">
                {exportError && (
                    <Alert variant="destructive">
                        <AlertDescription>{exportError}</AlertDescription>
                    </Alert>
                )}

                {contractId && (
                    <Alert>
                        <AlertDescription>
                            Hợp đồng đã được tạo với mã số: <strong>HD{contractId}</strong>
                        </AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardContent className="p-0">
                        <ContractTemplate
                            ref={contractRef}
                            contractData={contractData}
                            signerSigRef={buyerSigRef}
                            onClearSignature={() => clearSignature(buyerSigRef)}
                        />
                    </CardContent>
                </Card>

                <div className="text-center space-y-4">
                    <Button
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="px-8 py-3 text-lg"
                        size="lg"
                    >
                        {isExporting ? (
                            <>
                                <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                                Đang xử lý hợp đồng...
                            </>
                        ) : (
                            <>
                                <FiDownload className="w-5 h-5 mr-2" />
                                Ký và lưu hợp đồng
                            </>
                        )}
                    </Button>

                    <p className="text-sm text-gray-500">
                        <FiFileText className="w-4 h-4 inline mr-1" />
                        {isExporting
                            ? "Đang tạo hợp đồng, upload file và lưu vào hệ thống..."
                            : "Hợp đồng sẽ được tạo, lưu trữ và tải xuống tự động"
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}
