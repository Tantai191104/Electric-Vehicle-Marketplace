import { FiCheck } from "react-icons/fi";
import ContractPreview from "@/components/ContractPreview";
import { SignaturePadComponent } from "@/components/SignaturePadComponent";

interface ContractStepProps {
    contractHtml: string;
    buyerSignature: string;
    onSignatureChange: (signature: string) => void;
}

export function ContractStep({ contractHtml, buyerSignature, onSignatureChange }: ContractStepProps) {
    return (
        <div>
            <h3 className="font-semibold mb-2">Hợp đồng mua bán</h3>
            {contractHtml ? (
                <ContractPreview contractHtml={contractHtml} />
            ) : (
                <div className="border p-4 mb-4 bg-gray-50 text-red-500">
                    Không tìm thấy hợp đồng cho sản phẩm này.
                </div>
            )}
            <div className="mb-4">
                <label className="block font-medium mb-1">Chữ ký của bạn:</label>
                <SignaturePadComponent onChange={onSignatureChange} />
                {buyerSignature && (
                    <div className="mt-2">
                        <span className="text-xs text-green-600">Đã ký hợp đồng</span>
                    </div>
                )}
            </div>
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
                Hợp đồng số <span className="font-mono font-semibold">{contractId}</span> đã được lưu và sẵn sàng để gửi lên server khi bạn xác nhận thanh toán.
            </p>
            <p className="text-xs text-green-600 mt-1">
                File: {contractPdf.name} ({(contractPdf.size / 1024).toFixed(2)} KB)
            </p>
        </div>
    );
}
