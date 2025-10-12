import { useRef, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FiDownload, FiFileText, FiLoader, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { toast } from 'sonner';
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

    // Memoize contract data để tránh tính toán lại không cần thiết
    const contractData: ContractInfo | null = useMemo(() => {
        if (!product || !buyer || !seller) return null;

        return {
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
    }, [product, buyer, seller]);

    const handleClearSignature = useCallback(() => {
        clearSignature(buyerSigRef);
        toast.info("Đã xóa chữ ký", {
            description: "Vui lòng ký lại để tiếp tục",
            icon: <FiAlertCircle />
        });
    }, []);
    const downloadPDF = useCallback((blob: Blob, contractId: string) => {
        return new Promise<void>((resolve) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = `hop-dong-${contractId}.pdf`;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();

            // Show download toast
            toast.success("Đang tải xuống PDF", {
                description: `Tệp: hop-dong-${contractId}.pdf`,
                icon: <FiDownload />
            });

            // Cleanup async
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                resolve();
            }, 100);
        });
    }, []);
    // Tách logic tạo PDF để tối ưu - FIXED VERSION
    const createOptimizedPDF = useCallback(async (newContractId: string): Promise<Blob | null> => {
        if (!contractRef.current) {
            throw new Error("Contract reference not found");
        }

        // Show progress toast
        toast.loading("Đang tạo PDF hợp đồng...", {
            description: "Vui lòng đợi trong giây lát",
            id: "pdf-creation"
        });

        const originalElement = contractRef.current;
        const clonedElement = originalElement.cloneNode(true) as HTMLDivElement;

        // Cập nhật contract number trong clone
        const contractNumberElement = clonedElement.querySelector('[data-contract-number]');
        if (contractNumberElement) {
            contractNumberElement.textContent = `Số hợp đồng: HD${newContractId}`;
        }

        // Tạo container với visibility visible ngay từ đầu
        const tempContainer = document.createElement("div");
        tempContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 794px;
            background: white;
            font-family: Arial, sans-serif;
            color: black;
            line-height: 1.6;
            padding: 40px;
            box-sizing: border-box;
            z-index: -1;
            opacity: 0;
            pointer-events: none;
        `;

        // Apply inline styles trước khi add vào DOM
        applyPDFSafeStyles(clonedElement);
        tempContainer.appendChild(clonedElement);
        document.body.appendChild(tempContainer);

        try {
            // Process signatures với better error handling
            await replaceSignatureCanvasWithImages(clonedElement, { signer: buyerSigRef });

            // Đợi DOM stabilize
            await new Promise((resolve) => setTimeout(resolve, 300));

            // Kiểm tra element có trong DOM không
            if (!document.body.contains(tempContainer)) {
                throw new Error("Temp container not found in DOM");
            }

            const pdfBlob = await exportToPDF({
                element: tempContainer,
                filename: `hop-dong-${newContractId}.pdf`,
                quality: 0.85,
                scale: 1.5,
                returnBlob: true
            });

            // Dismiss loading toast
            toast.dismiss("pdf-creation");

            // Show success toast
            toast.success("PDF đã được tạo thành công!", {
                description: "Đang chuẩn bị upload lên server...",
                icon: <FiCheckCircle />
            });

            return pdfBlob ?? null;
        } finally {
            // Always cleanup
            if (document.body.contains(tempContainer)) {
                document.body.removeChild(tempContainer);
            }
            // Dismiss loading toast in case of error
            toast.dismiss("pdf-creation");
        }
    }, []);

    // Helper function để áp dụng inline styles
    const applyPDFSafeStyles = (element: HTMLDivElement): void => {
        // Reset root element
        element.style.cssText = `
            background: white;
            color: black;
            font-family: Arial, sans-serif;
            line-height: 1.6;
            padding: 0;
            margin: 0;
            width: 100%;
            min-height: auto;
        `;

        // Remove all buttons first
        const buttons = element.querySelectorAll('button');
        buttons.forEach(button => button.remove());

        // Apply styles to all elements
        const allElements = element.querySelectorAll('*');
        allElements.forEach((el: Element) => {
            const htmlEl = el as HTMLElement;

            // Reset and apply safe styles
            htmlEl.style.cssText = '';

            // Typography
            if (htmlEl.classList.contains('text-3xl')) {
                htmlEl.style.cssText = 'font-size: 30px; font-weight: bold; color: black; text-align: center; margin: 0 0 8px 0;';
            } else if (htmlEl.classList.contains('text-lg')) {
                htmlEl.style.cssText = 'font-size: 18px; font-weight: 600; color: black; margin: 0 0 16px 0;';
            } else if (htmlEl.classList.contains('text-sm')) {
                htmlEl.style.cssText = 'font-size: 14px; color: #666666;';
            } else if (htmlEl.classList.contains('text-xs')) {
                htmlEl.style.cssText = 'font-size: 12px; color: #888888;';
            }

            // Tables
            if (htmlEl.tagName === 'TABLE') {
                htmlEl.style.cssText = 'width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;';
            } else if (htmlEl.tagName === 'TD') {
                let tdStyle = 'padding: 12px; border: 1px solid #cccccc; vertical-align: top;';

                if (htmlEl.classList.contains('font-semibold') || htmlEl.classList.contains('bg-gray-50')) {
                    tdStyle += ' font-weight: 600; background: #f9f9f9;';
                }
                if (htmlEl.classList.contains('text-green-600')) {
                    tdStyle += ' color: #16a34a; font-weight: 600;';
                }

                htmlEl.style.cssText = tdStyle;
            }

            // Backgrounds
            if (htmlEl.classList.contains('bg-gray-50')) {
                htmlEl.style.cssText = 'background: #f9f9f9; padding: 16px; margin: 8px 0; border-radius: 8px;';
            }

            // Layouts
            if (htmlEl.classList.contains('grid-cols-2')) {
                htmlEl.style.cssText = 'display: flex; gap: 32px; margin: 48px 0 0 0;';
            }
            if (htmlEl.closest('.grid-cols-2') && htmlEl !== htmlEl.closest('.grid-cols-2')) {
                htmlEl.style.cssText = 'flex: 1; text-align: center;';
            }

            // Text alignment
            if (htmlEl.classList.contains('text-center')) {
                htmlEl.style.textAlign = 'center';
            }

            // Font weights
            if (htmlEl.classList.contains('font-bold') || htmlEl.tagName === 'STRONG') {
                htmlEl.style.fontWeight = 'bold';
            }
            if (htmlEl.classList.contains('font-semibold')) {
                htmlEl.style.fontWeight = '600';
            }

            // Margins
            if (htmlEl.classList.contains('mb-8')) htmlEl.style.marginBottom = '32px';
            if (htmlEl.classList.contains('mb-4')) htmlEl.style.marginBottom = '16px';
            if (htmlEl.classList.contains('mb-2')) htmlEl.style.marginBottom = '8px';
            if (htmlEl.classList.contains('mt-12')) htmlEl.style.marginTop = '48px';
            if (htmlEl.classList.contains('mt-2')) htmlEl.style.marginTop = '8px';

            // Remove problematic positioning
            if (htmlEl.classList.contains('relative')) {
                htmlEl.style.position = 'static';
            }
        });
    };

    // Memoize export handler để tránh tạo lại không cần thiết
    const handleExportError = useCallback((err: unknown) => {
        console.error("Export error:", err);

        let message = "Có lỗi xảy ra. Vui lòng thử lại.";
        let description = "";

        if (err instanceof Error) {
            const rawMsg = err.message || "";
            const lowerMsg = rawMsg.toLowerCase();

            if (lowerMsg.includes("network") || lowerMsg.includes("fetch") || lowerMsg.includes("failed to fetch")) {
                message = "Lỗi kết nối mạng";
                description = "Vui lòng kiểm tra internet và thử lại.";
            } else if (lowerMsg.includes("timeout")) {
                message = "Kết nối quá hạn";
                description = "Vui lòng thử lại sau.";
            } else if (lowerMsg.includes("403") || lowerMsg.includes("401")) {
                message = "Phiên đăng nhập hết hạn";
                description = "Vui lòng đăng nhập lại.";
            } else if (lowerMsg.includes("500") || lowerMsg.includes("internal server error")) {
                message = "Lỗi hệ thống";
                description = "Vui lòng liên hệ hỗ trợ.";
            } else {
                message = "Lỗi xử lý";
                description = rawMsg;
            }
        }

        // Show error toast
        toast.error(message, {
            description,
            icon: <FiAlertCircle />,
            duration: 6000,
            action: {
                label: "Thử lại",
                onClick: () => handleExportPDF()
            }
        });

        setExportError(message + (description ? `: ${description}` : ""));
    }, []);

    const uploadAndDownloadPDF = useCallback(async (contractId: string, pdfBlob: Blob) => {
        const pdfFile = new File([pdfBlob], `hop-dong-${contractId}.pdf`, {
            type: 'application/pdf'
        });

        // Show upload progress toast
        toast.loading("Đang upload hợp đồng lên server...", {
            description: "Vui lòng không đóng trang",
            id: "upload-progress"
        });

        try {
            // Upload và download song song
            await Promise.all([
                contractServices.signContract(contractId, pdfFile, window.location.href),
                downloadPDF(pdfBlob, contractId) // Download ngay không cần đợi upload
            ]);

            // Dismiss upload toast
            toast.dismiss("upload-progress");

            // Show final success toast
            toast.success("Hợp đồng hoàn tất!", {
                description: `Mã hợp đồng: HD${contractId} - Đã lưu thành công`,
                icon: <FiCheckCircle />,
                duration: 8000,
                action: {
                    label: "Xem hợp đồng",
                    onClick: () => {
                        // Navigate to contracts page or stay
                        console.log("View contract:", contractId);
                    }
                }
            });

            setContractId(contractId);

        } catch (error) {
            toast.dismiss("upload-progress");
            throw error; // Re-throw to be handled by main error handler
        }
    }, [downloadPDF]);

    // Optimized export PDF với debounce và caching
    const handleExportPDF = useCallback(async () => {
        if (!contractRef.current || !contractData) {
            toast.error("Không tìm thấy nội dung hợp đồng", {
                description: "Vui lòng tải lại trang",
                icon: <FiAlertCircle />
            });
            setExportError("Không tìm thấy nội dung hợp đồng");
            return;
        }

        // Kiểm tra chữ ký
        if (!buyerSigRef.current || buyerSigRef.current.isEmpty()) {
            toast.error("Chưa có chữ ký", {
                description: "Vui lòng ký tên trước khi xuất PDF",
                icon: <FiAlertCircle />
            });
            setExportError("Vui lòng ký tên trước khi xuất PDF");
            return;
        }

        // Prevent double submission
        if (isExporting) {
            toast.warning("Đang xử lý", {
                description: "Vui lòng đợi quá trình hiện tại hoàn tất",
                icon: <FiLoader />
            });
            return;
        }

        setIsExporting(true);
        setExportError(null);

        // Show initial progress toast
        toast.loading("Bắt đầu tạo hợp đồng...", {
            description: "Đang khởi tạo hợp đồng trong hệ thống",
            id: "contract-creation"
        });

        try {
            // Bước 1: Tạo contract trong database
            const contractResponse = await contractServices.createContract({
                product_id: product._id,
                seller_id: seller.idNumber,
            });

            const newContractId = contractResponse.data.contractId;

            // Update progress
            toast.loading("Đã tạo hợp đồng, đang tạo PDF...", {
                description: `Mã hợp đồng: HD${newContractId}`,
                id: "contract-creation"
            });

            // Bước 2: Tạo PDF optimized
            const pdfBlob = await createOptimizedPDF(newContractId);

            // Dismiss creation toast
            toast.dismiss("contract-creation");

            // Bước 3: Upload PDF
            if (pdfBlob) {
                await uploadAndDownloadPDF(newContractId, pdfBlob);
            }

        } catch (err) {
            // Dismiss all progress toasts
            toast.dismiss("contract-creation");
            toast.dismiss("pdf-creation");
            toast.dismiss("upload-progress");

            handleExportError(err);
        } finally {
            setIsExporting(false);
        }
    }, [contractRef, contractData, buyerSigRef, isExporting, product, seller, createOptimizedPDF, handleExportError, uploadAndDownloadPDF]);

    if (!contractData) {
        return (
            <div className="pt-32 text-center">
                <p className="text-red-600 font-semibold">Không tìm thấy dữ liệu hợp đồng</p>
                <Button onClick={() => navigate(-1)}>Quay lại</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto pt-32 pb-6 px-6 space-y-6">
                {exportError && (
                    <Alert variant="destructive">
                        <FiAlertCircle className="h-4 w-4" />
                        <AlertDescription>{exportError}</AlertDescription>
                    </Alert>
                )}

                {contractId && (
                    <Alert>
                        <FiCheckCircle className="h-4 w-4" />
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
                            onClearSignature={handleClearSignature}
                        />
                    </CardContent>
                </Card>

                <div className="text-center space-y-4">
                    <div className="text-sm text-gray-600 space-y-1">
                        <p className="flex items-center justify-center gap-2">
                            <FiAlertCircle className="w-4 h-4 text-amber-500" />
                            Vui lòng ký tên trước khi xuất PDF
                        </p>
                        <p className="flex items-center justify-center gap-2">
                            <FiFileText className="w-4 h-4 text-blue-500" />
                            Hợp đồng sẽ được tự động lưu vào hệ thống
                        </p>
                    </div>

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
