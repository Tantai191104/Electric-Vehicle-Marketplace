import React from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { FiTrash2 } from "react-icons/fi";
import type { ContractInfo } from "@/types/contractTypes";

interface Props {
    contractData: ContractInfo;
    signerSigRef?: React.RefObject<SignatureCanvas | null>;
    onClearSignature?: () => void;
    serverTerms?: Array<{ title: string; content: string }>;
    extraTerms?: Array<{ title: string; content: string }>;
}

export const ContractTemplate = React.forwardRef<HTMLDivElement, Props>(
    ({ contractData, signerSigRef, onClearSignature, serverTerms, extraTerms }, ref) => {
        const mergedTerms = [...(serverTerms || []), ...(extraTerms || [])];

        return (
            <div
                ref={ref}
                style={{
                    backgroundColor: "white",
                    padding: 32,
                    color: "#1f2937",
                    lineHeight: 1.6,
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>HỢP ĐỒNG MUA BÁN</h1>
                    <p style={{ fontSize: 13, color: "#6b7280" }} data-contract-number>
                        {contractData.contractNumber}
                    </p>
                </div>

                <section style={{ marginBottom: 18 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>THÔNG TIN HỢP ĐỒNG</h2>
                    <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: 8, fontWeight: 600, width: "30%", background: "#f8fafc" }}>Bên bán</td>
                                <td style={{ padding: 8 }}>{contractData.seller.name}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: 8, fontWeight: 600, background: "#f8fafc" }}>CCCD/CMND</td>
                                <td style={{ padding: 8 }}>{contractData.seller.idNumber}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: 8, fontWeight: 600, background: "#f8fafc" }}>Bên mua</td>
                                <td style={{ padding: 8 }}>{contractData.buyer.name}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: 8, fontWeight: 600, background: "#f8fafc" }}>CCCD/CMND</td>
                                <td style={{ padding: 8 }}>{contractData.buyer.idNumber}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: 8, fontWeight: 600, background: "#f8fafc" }}>Sản phẩm</td>
                                <td style={{ padding: 8 }}>{contractData.vehicle.name}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: 8, fontWeight: 600, background: "#f8fafc" }}>Giá trị</td>
                                <td style={{ padding: 8, color: "#16a34a", fontWeight: 600 }}>
                                    {new Intl.NumberFormat("vi-VN").format(contractData.price)} VNĐ ({contractData.priceInWords})
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section style={{ marginBottom: 18 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>ĐIỀU KHOẢN</h3>
                    <div style={{ fontSize: 14 }}>
                        {mergedTerms.length === 0 ? (
                            <p>Không có điều khoản trong mẫu.</p>
                        ) : (
                            mergedTerms.map((t, idx) => (
                                <div key={idx} style={{ background: "#f8fafc", padding: 12, marginBottom: 10, borderRadius: 6 }}>
                                    <p style={{ margin: 0 }}>
                                        <strong>{t.title}</strong>: {t.content}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section style={{ marginTop: 24 }}>
                    <div style={{ display: "flex", gap: 20 }}>
                        <div style={{ flex: 1, textAlign: "center" }}>
                            <div style={{ marginBottom: 8, fontWeight: 600 }}>Người ký</div>
                            <div data-signature="buyer" style={{ border: "1px solid #e5e7eb", background: "#f8fafc", height: 120 }}>
                                {/* render canvas if provided */}
                                {signerSigRef ? (
                                    <SignatureCanvas
                                        ref={signerSigRef}
                                        canvasProps={{ width: 400, height: 120, style: { width: "100%", height: "100%" } }}
                                    />
                                ) : null}
                            </div>
                            <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>{contractData.buyer.name}</div>
                            {onClearSignature ? (
                                <div style={{ marginTop: 6 }}>
                                    <Button variant="ghost" size="sm" onClick={onClearSignature}>
                                        <FiTrash2 />
                                    </Button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </section>

                <footer style={{ marginTop: 24, fontSize: 12, color: "#6b7280", textAlign: "center" }}>
                    <div>Ngày ký: {contractData.signDate}</div>
                </footer>
            </div>
        );
    }
);

ContractTemplate.displayName = "ContractTemplate";

export default ContractTemplate;
