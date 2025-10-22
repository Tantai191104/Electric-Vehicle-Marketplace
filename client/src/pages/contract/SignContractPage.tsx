import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { productServices } from "@/services/productServices";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import SignaturePad from "react-signature-canvas";
import { useRef } from "react";

const SignContractPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  useAuthStore();
  const [html, setHtml] = useState<string>("");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const sigPadRef = useRef<SignaturePad | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        setLoading(true);
  const res = await productServices.fetchProductById(productId);
        // assume contractTemplate.htmlContent exists on product
        const htmlContent = res?.data?.contractTemplate?.htmlContent || res?.contractTemplate?.htmlContent || "";
        setHtml(htmlContent || "");
      } catch (err) {
        console.error(err);
        toast.error("Không tải được hợp đồng");
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  // signature pad helpers
  const clearPad = () => {
    sigPadRef.current?.clear();
    setSignatureDataUrl(null);
  };

  const savePadToDataUrl = () => {
    if (!sigPadRef.current) return null;
    if (sigPadRef.current.isEmpty()) return null;
    // get trimmed image
    const dataUrl = sigPadRef.current.getTrimmedCanvas().toDataURL("image/png");
    setSignatureDataUrl(dataUrl);
    return dataUrl;
  };

  const handleSave = async () => {
    if (!productId) return toast.error("Sản phẩm không tồn tại");
    if (!signatureDataUrl) return toast.error("Vui lòng tải lên chữ ký");
    try {
      setLoading(true);
      // embed buyer signature into existing htmlContent
      const res = await productServices.fetchProductById(productId);
      const existingHtml = res?.data?.contractTemplate?.htmlContent || res?.contractTemplate?.htmlContent || "";
      const insertion = `\n<div class="section"><div class="title">CHỮ KÝ NGƯỜI MUA</div><div style="margin-top:8px"><img src="${signatureDataUrl}" style="max-height:120px" /></div></div>`;
      const idx = existingHtml.lastIndexOf("</body>");
      const newHtml = idx !== -1 ? existingHtml.slice(0, idx) + insertion + existingHtml.slice(idx) : existingHtml + insertion;
      await productServices.updateContractTemplate(productId, { htmlContent: newHtml });
      toast.success("Đã ký hợp đồng thành công");
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error("Lưu chữ ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Ký hợp đồng</h2>
        {loading ? (
          <div>Đang tải…</div>
        ) : (
          <>
            <div className="border p-3 mb-4 overflow-auto max-h-[60vh]" dangerouslySetInnerHTML={{ __html: html || "<div>Không có hợp đồng</div>" }} />

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Ký trực tiếp (vẽ vào ô bên dưới)</label>
                      <div className="border p-2">
                        <SignaturePad
                          ref={sigPadRef}
                          canvasProps={{ className: "signature-canvas", width: 800, height: 200, style: { width: "100%", height: 200 } }}
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" onClick={clearPad}>Xóa</Button>
                        <Button
                          onClick={() => {
                            const d = savePadToDataUrl();
                            if (!d) toast.error("Vui lòng ký vào ô trước khi lưu");
                          }}
                        >Lưu tạm</Button>
                      </div>
                      {signatureDataUrl && <img src={signatureDataUrl} alt="signature preview" className="mt-3 max-h-40" />}
                    </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => navigate(-1)}>Quay lại</Button>
              <Button onClick={handleSave} disabled={loading || !signatureDataUrl}>Ký và lưu</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SignContractPage;
