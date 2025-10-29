import { FiCheck } from "react-icons/fi";
import ContractPreview from "@/components/ContractPreview";
import { SignaturePadComponent } from "@/components/SignaturePadComponent";
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

interface ContractStepProps {
    contractHtml: string;
    buyerSignature: string;
    onSignatureChange: (signature: string) => void;
}

export function ContractStep({
    contractHtml,
    buyerSignature,
    onSignatureChange,
}: ContractStepProps) {
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!previewRef.current) return;

        const container = previewRef.current;
        const canvas = container.querySelector("#buyer-signature-canvas");
        if (canvas) {
            // Tạo mount point mới thay thế vùng ký trong template
            const mountPoint = document.createElement("div");
            mountPoint.id = "buyer-signature-pad-react";
            canvas.parentNode?.replaceChild(mountPoint, canvas);
            const root = createRoot(mountPoint);

            // Render vùng ký + nút xóa bên dưới nếu đã ký
            root.render(
                <div className="flex flex-col items-start gap-2">
                    {buyerSignature ? (
                        <>
                            <img
                                src={buyerSignature}
                                alt="Chữ ký của bạn"
                                style={{
                                    width: "220px",
                                    height: "80px",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc",
                                    background: "#fff",
                                }}
                            />
                            <button
                                type="button"
                                className="mt-2 px-3 py-1 bg-gray-100 border rounded text-xs text-gray-700 hover:bg-gray-200"
                                onClick={() => onSignatureChange("")}
                            >
                                Xóa chữ ký
                            </button>
                        </>
                    ) : (
                        <SignaturePadComponent onChange={onSignatureChange} />
                    )}
                </div>
            );
        }
    }, [contractHtml, buyerSignature, onSignatureChange]);

    return (
        <div>
            <h3 className="font-semibold mb-2">Hợp đồng mua bán</h3>
            {contractHtml ? (
                <div ref={previewRef}>
                    <ContractPreview contractHtml={contractHtml} />
                </div>
            ) : (
                <div className="border p-4 mb-4 bg-gray-50 text-red-500">
                    Không tìm thấy hợp đồng cho sản phẩm này.
                </div>
            )}
        </div>
    );
}

interface ContractConfirmationProps {
    contractPdf: File;
    contractId: string;
}

export function ContractConfirmation({ contractPdf, contractId }: ContractConfirmationProps) {
    return (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
                <FiCheck className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Hợp đồng đã được tạo</h3>
            </div>
            <p className="text-sm text-green-700">
                Hợp đồng số
                <span className="font-mono font-semibold">{contractId}</span> đã được lưu và sẵn sàng
                để gửi lên hệ thống khi bạn xác nhận thanh toán.
            </p>
            <p className="text-xs text-green-600 mt-1">
                File: {contractPdf.name} ({(contractPdf.size / 1024).toFixed(2)} KB)
            </p>
        </div>
    );
}
