import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FiDownload, FiFileText, FiLoader } from "react-icons/fi";

// Utils
import { exportToPDF } from "@/utils/pdfExport";
import { replaceSignatureCanvasWithImages, clearSignature } from "@/utils/signatureHandler";

// Components & Types
import { mockContractData } from "@/types/contractTypes";
import { ContractTemplate } from "./ContractTemplate";

export default function ContractPage() {
    const contractRef = useRef<HTMLDivElement>(null);
    const buyerSigRef = useRef<SignatureCanvas>(null) as React.RefObject<SignatureCanvas>;
    const sellerSigRef = useRef<SignatureCanvas>(null) as React.RefObject<SignatureCanvas>;

    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    const handleExportPDF = async () => {
        if (!contractRef.current) {
            setExportError("Không tìm thấy nội dung hợp đồng");
            return;
        }

        setIsExporting(true);
        setExportError(null);

        try {
            // Clone element và xử lý signatures TRƯỚC khi export
            const clonedElement = contractRef.current.cloneNode(true) as HTMLDivElement;
            
            // Tạo container tạm để xử lý
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

            // Thay thế signature canvas bằng images
            await replaceSignatureCanvasWithImages(clonedElement, {
                buyer: buyerSigRef,
                seller: sellerSigRef
            });

            // Đợi DOM render
            await new Promise(resolve => setTimeout(resolve, 200));

            // Export PDF với container đã xử lý
            await exportToPDF({
                element: tempContainer,
                filename: `hop-dong-mua-ban-xe-${Date.now()}.pdf`,
                quality: 0.95,
                scale: 2
            });

            // Cleanup
            document.body.removeChild(tempContainer);

        } catch (err) {
            console.error("PDF Export Error:", err);
            setExportError(err instanceof Error ? err.message : "Lỗi không xác định");
            
            // Cleanup nếu có lỗi
            const temp = document.querySelector("body > div[style*='position: absolute']");
            if (temp) temp.remove();
        } finally {
            setIsExporting(false);
        }
    };

    const handleClearBuyerSignature = () => {
        clearSignature(buyerSigRef);
    };

    const handleClearSellerSignature = () => {
        clearSignature(sellerSigRef);
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
            <div className="max-w-4xl mx-auto pt-32 pb-6 px-6 space-y-6">
                {/* Error Alert */}
                {exportError && (
                    <Alert style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
                        <AlertDescription style={{ color: '#991b1b' }}>
                            {exportError}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Contract */}
                <Card style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
                    <CardContent className="p-0">
                        <ContractTemplate
                            ref={contractRef}
                            contractData={mockContractData}
                            buyerSigRef={buyerSigRef}
                            sellerSigRef={sellerSigRef}
                            onClearBuyerSignature={handleClearBuyerSignature}
                            onClearSellerSignature={handleClearSellerSignature}
                        />
                    </CardContent>
                </Card>

                {/* Export Button */}
                <div style={{ textAlign: 'center' }}>
                    <Button
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        style={{
                            background: '#111827',
                            color: 'white',
                            padding: '12px 32px',
                            fontSize: '18px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isExporting ? (
                            <>
                                <FiLoader style={{ width: '20px', height: '20px', marginRight: '8px' }} className="animate-spin" />
                                Đang xuất PDF...
                            </>
                        ) : (
                            <>
                                <FiDownload style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                                Xuất PDF hợp đồng
                            </>
                        )}
                    </Button>

                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '12px' }}>
                        <FiFileText style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />
                        PDF sẽ được tải xuống tự động sau khi tạo thành công
                    </p>
                </div>
            </div>
        </div>
    );
}
