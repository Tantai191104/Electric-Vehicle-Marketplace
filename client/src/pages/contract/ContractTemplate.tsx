import React from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { FiTrash2 } from "react-icons/fi";
import type { ContractInfo } from "@/types/contractTypes";

interface Props {
    contractData: ContractInfo;
    buyerSigRef: React.RefObject<SignatureCanvas>;
    sellerSigRef: React.RefObject<SignatureCanvas>;
    onClearBuyerSignature: () => void;
    onClearSellerSignature: () => void;
}

export const ContractTemplate = React.forwardRef<HTMLDivElement, Props>(({
    contractData,
    buyerSigRef,
    sellerSigRef,
    onClearBuyerSignature,
    onClearSellerSignature
}, ref) => {
    return (
        <div
            ref={ref}
            style={{
                backgroundColor: 'white',
                padding: '32px',
                color: '#1f2937',
                lineHeight: '1.625'
            }}
        >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{
                    fontSize: '30px',
                    fontWeight: 'bold',
                    color: '#111827',
                    marginBottom: '8px'
                }}>
                    HỢP ĐỒNG MUA BÁN XE
                </h1>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    Số hợp đồng: {contractData.contractNumber}
                </p>
            </div>

            {/* Contract Info */}
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '16px',
                    color: '#111827'
                }}>
                    THÔNG TIN HỢP ĐỒNG
                </h2>
                <table style={{
                    width: '100%',
                    fontSize: '14px',
                    borderCollapse: 'collapse',
                    border: '1px solid #d1d5db'
                }}>
                    <tbody>
                        <tr>
                            <td style={headerCellStyle}>Bên bán (Người bán)</td>
                            <td style={cellStyle}>{contractData.seller.name}</td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>CCCD/CMND</td>
                            <td style={cellStyle}>{contractData.seller.idNumber}</td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>Bên mua (Người mua)</td>
                            <td style={cellStyle}>{contractData.buyer.name}</td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>CCCD/CMND</td>
                            <td style={cellStyle}>{contractData.buyer.idNumber}</td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>Phương tiện</td>
                            <td style={cellStyle}>{contractData.vehicle.name}</td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>Biển số xe</td>
                            <td style={cellStyle}>{contractData.vehicle.plateNumber}</td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>Giá trị hợp đồng</td>
                            <td style={{
                                ...cellStyle,
                                fontWeight: '600',
                                color: '#16a34a'
                            }}>
                                {new Intl.NumberFormat('vi-VN').format(contractData.price)} VNĐ ({contractData.priceInWords})
                            </td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>Ngày ký hợp đồng</td>
                            <td style={cellStyle}>{contractData.signDate}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Terms */}
            <ContractTerms />

            {/* Signatures */}
            <div style={{
                display: 'flex',
                gap: '32px',
                marginTop: '48px'
            }}>
                <SignatureSection
                    title="BÊN MUA"
                    sigRef={buyerSigRef}
                    onClear={onClearBuyerSignature}
                    signerName={contractData.buyer.name}
                    dataSignature="buyer"
                />

                <SignatureSection
                    title="BÊN BÁN"
                    sigRef={sellerSigRef}
                    onClear={onClearSellerSignature}
                    signerName={contractData.seller.name}
                    dataSignature="seller"
                />
            </div>

            {/* Footer */}
            <div style={{
                marginTop: '48px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#6b7280'
            }}>
                <p>
                    Hợp đồng này được lập thành 02 bản có giá trị pháp lý như nhau,
                    mỗi bên giữ 01 bản.
                </p>
                <p style={{ marginTop: '8px' }}>
                    <strong>Ngày ký:</strong> {contractData.signDate}
                </p>
            </div>
        </div>
    );
});

const ContractTerms: React.FC = () => (
    <div style={{ marginBottom: '32px' }}>
        <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#111827'
        }}>
            ĐIỀU KHOẢN HỢP ĐỒNG
        </h2>
        <div style={{ fontSize: '14px', lineHeight: '1.625' }}>
            {terms.map((term, index) => (
                <div key={index} style={termBoxStyle}>
                    <p>
                        <strong>{term.title}:</strong> {term.content}
                    </p>
                </div>
            ))}
        </div>
    </div>
);

interface SignatureSectionProps {
    title: string;
    sigRef: React.RefObject<SignatureCanvas>;
    onClear: () => void;
    signerName: string;
    dataSignature: string;
}

const SignatureSection: React.FC<SignatureSectionProps> = ({
    title,
    sigRef,
    onClear,
    signerName,
    dataSignature
}) => (
    <div style={{ flex: '1', textAlign: 'center' }}>
        <h3 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            {title}
        </h3>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            (Ký tên và ghi rõ họ tên)
        </p>
        <div style={{ position: 'relative' }}>
            {/* QUAN TRỌNG: Đảm bảo có data-signature attribute */}
            <div data-signature={dataSignature} style={{ position: 'relative' }}>
                <SignatureCanvas
                    ref={sigRef}
                    canvasProps={{
                        style: {
                            border: '1px solid #d1d5db',
                            width: '100%',
                            height: '128px',
                            background: '#f9fafb',
                            borderRadius: '4px'
                        }
                    }}
                />
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    height: '24px',
                    width: '24px',
                    padding: '0',
                    color: '#ef4444'
                }}
            >
                <FiTrash2 style={{ width: '12px', height: '12px' }} />
            </Button>
        </div>
        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
            {signerName}
        </p>
    </div>
);

// Styles
const headerCellStyle: React.CSSProperties = {
    padding: '12px',
    fontWeight: '600',
    width: '33.333333%',
    border: '1px solid #d1d5db',
    background: '#f9fafb'
};

const cellStyle: React.CSSProperties = {
    padding: '12px',
    border: '1px solid #d1d5db'
};

const termBoxStyle: React.CSSProperties = {
    background: '#f9fafb',
    padding: '16px',
    marginBottom: '16px',
    borderRadius: '8px'
};

const terms = [
    {
        title: "Điều 1 - Cam kết của bên bán",
        content: "Bên bán cam kết chiếc xe thuộc quyền sở hữu hợp pháp, không có tranh chấp, không thế chấp, đã thanh toán đầy đủ các khoản phí, lệ phí theo quy định của pháp luật."
    },
    {
        title: "Điều 2 - Nghĩa vụ của bên mua",
        content: "Bên mua cam kết thanh toán đủ số tiền đã thỏa thuận và nhận bàn giao xe trong vòng 03 ngày làm việc kể từ ngày ký hợp đồng này."
    },
    {
        title: "Điều 3 - Bàn giao xe",
        content: "Bên bán có trách nhiệm bàn giao xe cùng với toàn bộ giấy tờ pháp lý: giấy đăng ký xe, bảo hiểm, sổ bảo hành (nếu còn) cho bên mua."
    },
    {
        title: "Điều 4 - Giải quyết tranh chấp",
        content: "Hai bên cam kết thực hiện đúng các điều khoản đã thỏa thuận. Nếu có tranh chấp phát sinh, hai bên sẽ giải quyết thông qua thương lượng, hòa giải. Trường hợp không thể giải quyết được sẽ đưa ra Tòa án có thẩm quyền giải quyết theo quy định của pháp luật."
    }
];

ContractTemplate.displayName = "ContractTemplate";