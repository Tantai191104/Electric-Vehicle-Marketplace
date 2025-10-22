import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignaturePad from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { productServices } from "@/services/productServices";
import { toast } from "sonner";
import renderContractHtml from "@/lib/contractTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ContractEditorPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState<string>("");
  const [extraTerms, setExtraTerms] = useState<string>("");
  const [sellerSignatureDataUrl, setSellerSignatureDataUrl] = useState<string | null>(null);
  const [buyerSignatureDataUrl, setBuyerSignatureDataUrl] = useState<string | null>(null);
  const sellerPadRef = useRef<SignaturePad | null>(null);
  const buyerPadRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    if (!productId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await productServices.fetchProductById(productId);
        const ct = res?.data?.contractTemplate || res?.contractTemplate;
        if (ct?.htmlContent) {
          setHtml(ct.htmlContent);
        } else {
          // build initial html from product data
          const prod = res?.data || res;
          const p = prod || {};
          const product = {
            title: p.title || "...",
            brand: p.brand,
            model: p.model,
            year: p.year,
            condition: p.condition,
            price: p.price,
          };
          const seller = p.seller || p.author || undefined;
          const initial = renderContractHtml({ product, seller, buyer: undefined, unitPrice: p.price });
          setHtml(initial);
        }
      } catch (err) {
        console.error(err);
        toast.error("Không tải được hợp đồng");
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const clearPad = (who: "seller" | "buyer") => {
    if (who === "seller") {
      sellerPadRef.current?.clear();
      setSellerSignatureDataUrl(null);
    } else {
      buyerPadRef.current?.clear();
      setBuyerSignatureDataUrl(null);
    }
  };

  const savePad = (who: "seller" | "buyer") => {
    const pad = who === "seller" ? sellerPadRef.current : buyerPadRef.current;
    if (!pad) return null;
    if (pad.isEmpty()) return null;
    const dataUrl = pad.getTrimmedCanvas().toDataURL("image/png");
    if (who === "seller") setSellerSignatureDataUrl(dataUrl);
    else setBuyerSignatureDataUrl(dataUrl);
    return dataUrl;
  };

  const assembleFinalHtml = (baseHtml: string, additions: string, buyerSigBase64?: string | null) => {
    const insertion = `\n<div class="section"><div class="title">ĐIỀU KHOẢN BỔ SUNG</div><div>${additions}</div></div>`;
    let final = baseHtml;
    const idx = final.lastIndexOf("</body>");
    if (idx !== -1) final = final.slice(0, idx) + insertion + final.slice(idx);
    else final = final + insertion;

    // embed buyer signature into final HTML if provided
    if (buyerSigBase64) {
      const sigSection = `\n<div class="section"><div class="title">CHỮ KÝ NGƯỜI MUA</div><div style="margin-top:8px"><img src="${buyerSigBase64}" style="max-height:120px" /></div></div>`;
      const idx2 = final.lastIndexOf("</body>");
      if (idx2 !== -1) final = final.slice(0, idx2) + sigSection + final.slice(idx2);
      else final = final + sigSection;
    }
    return final;
  };

  const handleSaveContract = async () => {
    if (!productId) return toast.error("Không tìm thấy productId để lưu hợp đồng");
    try {
      setLoading(true);
      const finalHtml = assembleFinalHtml(html, extraTerms, buyerSignatureDataUrl || null);
      await productServices.updateContractTemplate(productId, {
        htmlContent: finalHtml,
        sellerSignature: sellerSignatureDataUrl || null,
      });
      toast.success("Đã lưu hợp đồng");
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error("Lưu hợp đồng thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePdfAndSave = async () => {
    if (!productId) return toast.error("Không tìm thấy productId để lưu PDF");
    try {
      setLoading(true);
      const idx = html.lastIndexOf("</body>");
      const insertion = `\n<div class="section"><div class="title">ĐIỀU KHOẢN BỔ SUNG</div><div>${extraTerms}</div></div>`;
      const htmlToRender = idx !== -1 ? html.slice(0, idx) + insertion + html.slice(idx) : html + insertion;
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.innerHTML = htmlToRender;
      document.body.appendChild(container);
      const canvas = await html2canvas(container, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
        // attempt to read image properties if available on this jsPDF build
        const getImgProps = (doc: unknown, data: string) => {
          try {
            const d = doc as Record<string, unknown>;
            const fn = d.getImageProperties as unknown;
            if (typeof fn === "function") return (fn as (d: string) => { width: number; height: number })(data);
          } catch {
            // ignore
          }
          return { width: 595, height: 842 };
        };
        const imgProps = getImgProps(pdf, imgData);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      const pdfBlob = pdf.output("blob");
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = String(reader.result || "");
        await productServices.updateContractTemplate(productId, { pdfUrl: base64, sellerSignature: sellerSignatureDataUrl || null, htmlContent: assembleFinalHtml(html, extraTerms, buyerSignatureDataUrl || null) });
        toast.success("PDF đã được tạo và lưu");
        document.body.removeChild(container);
        navigate(-1);
      };
      reader.readAsDataURL(pdfBlob);
    } catch (err) {
      console.error(err);
      toast.error("Tạo PDF thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3 w-full border p-3 overflow-auto max-h-[80vh]">
            <h2 className="text-lg font-bold mb-4">Xem trước hợp đồng</h2>
            <div dangerouslySetInnerHTML={{ __html: (function(){ const idx = html.lastIndexOf("</body>"); const insertion = `\n<div class="section"><div class="title">ĐIỀU KHOẢN BỔ SUNG</div><div>${extraTerms}</div></div>`; if (idx !== -1) return html.slice(0, idx) + insertion + html.slice(idx); return html + insertion; })() }} />
          </div>
          <div className="lg:w-1/3 w-full space-y-4">
            <div>
              <div className="font-semibold text-gray-700 text-sm mb-2">Thêm điều khoản bổ sung</div>
              <textarea className="w-full h-28 p-3 border rounded" value={extraTerms} onChange={(e) => setExtraTerms(e.target.value)} placeholder="Nhập điều khoản bổ sung..." />
            </div>

            <div>
              <div className="font-semibold text-gray-700 text-sm mb-2">Chữ ký bên bán (người tạo)</div>
              <div className="border p-2">
                <SignaturePad ref={sellerPadRef} canvasProps={{ className: "signature-canvas", width: 600, height: 150, style: { width: "100%", height: 150 } }} />
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" onClick={() => clearPad("seller")}>Xóa</Button>
                <Button onClick={() => savePad("seller")}>Lưu chữ ký</Button>
              </div>
              {sellerSignatureDataUrl && <img src={sellerSignatureDataUrl} alt="seller signature preview" className="mt-3 max-h-32" />}
            </div>

            <div>
              <div className="font-semibold text-gray-700 text-sm mb-2">Chữ ký bên mua</div>
              <div className="border p-2">
                <SignaturePad ref={buyerPadRef} canvasProps={{ className: "signature-canvas", width: 600, height: 150, style: { width: "100%", height: 150 } }} />
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" onClick={() => clearPad("buyer")}>Xóa</Button>
                <Button onClick={() => savePad("buyer")}>Lưu chữ ký</Button>
              </div>
              {buyerSignatureDataUrl && <img src={buyerSignatureDataUrl} alt="buyer signature preview" className="mt-3 max-h-32" />}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate(-1)}>Hủy</Button>
              <Button variant="secondary" onClick={handleGeneratePdfAndSave} disabled={loading}>Tạo PDF & Lưu</Button>
              <Button onClick={handleSaveContract} disabled={loading}>Lưu hợp đồng</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractEditorPage;
