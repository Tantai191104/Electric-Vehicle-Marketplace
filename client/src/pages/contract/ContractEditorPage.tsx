import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { productServices } from "@/services/productServices";
import { toast } from "sonner";
import renderContractHtml from "@/lib/contractTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import SignaturePad from "signature_pad";
import { useAuthStore } from "@/store/auth";

const ContractEditorPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState<string>("");

  // Lấy thông tin người mua từ auth
  const user = useAuthStore((state) => state.user);
  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await productServices.fetchProductById(productId);
        // Lấy thông tin sản phẩm và người bán
        const product = res?.data?.product || res?.product || res?.data || res;
        const buyer = res?.data?.buyer || res?.buyer || product?.buyer || null;
        // Build buyer info từ user (auth)
        const seller = user
          ? {
            _id: user._id || "", // Assuming _id is a string
            email: user.email || "",
            name: user.name || user.profile?.fullName || "",
            phone: user.phone || "",
            addressLine:
              (user.profile?.address?.houseNumber ? user.profile.address.houseNumber + ", " : "") +
              (user.profile?.address?.ward ? user.profile.address.ward + ", " : "") +
              (user.profile?.address?.district ? user.profile.address.district + ", " : "") +
              (user.profile?.address?.province ? user.profile.address.province : ""),
            profile: {
              ...user.profile,
              address: {
                houseNumber: user.profile?.address?.houseNumber ?? "",
                ward: user.profile?.address?.ward ?? "",
                district: user.profile?.address?.district ?? "",
                province: user.profile?.address?.province ?? "",
              },
            },
          }
          : {
            _id: "",
            email: "",
            name: "",
            phone: "",
            addressLine: "",
            profile: {
              address: {
                houseNumber: "",
                ward: "",
                district: "",
                province: "",
              },
            },
          };
        const data = {
          product: {
            title: product?.title || "",
            brand: product?.brand || "",
            model: product?.model || "",
            year: product?.year || "",
            condition: product?.condition || "",
            price: product?.price || "",
          },
          seller,
          buyer,
          unitPrice: product?.price || "",
          extraTerms: [],
        };
        // Render contract HTML và patch các thành phần động
        // Patch contract HTML, chỉ chèn nút thêm điều khoản nếu chưa có
        const html = renderContractHtml(data);
        // Không chèn thêm nút nữa, nút đã nằm trong template (id="add-extra-term-btn")
        setHtml(html);
      } catch {
        toast.error("Không tải được hợp đồng");
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, user]);

  // Khởi tạo SignaturePad khi iframe load xong
  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;

    if (!iframe?.contentDocument) return;
    // Khởi tạo signature pad cho seller
    const sellerPadDiv = iframe.contentDocument.getElementById("seller-signature-pad");
    const sellerCanvas = iframe.contentDocument.getElementById("seller-signature-canvas") as HTMLCanvasElement | null;
    let sellerPad: SignaturePad | null = null;
    if (sellerCanvas) {
      sellerPad = new SignaturePad(sellerCanvas, { backgroundColor: "#fff" });
      const updateSellerPadClass = () => {
        if (sellerPadDiv) {
          if (sellerPad && !sellerPad.isEmpty()) {
            sellerPadDiv.classList.add("has-signature");
          } else {
            sellerPadDiv.classList.remove("has-signature");
          }
        }
      };
      // Listen for drawing events to update pad class
      sellerCanvas.addEventListener("mouseup", updateSellerPadClass);
      sellerCanvas.addEventListener("touchend", updateSellerPadClass);
      sellerCanvas.addEventListener("mousedown", updateSellerPadClass);
      sellerCanvas.addEventListener("touchstart", updateSellerPadClass);
      updateSellerPadClass();
      const clearBtn = iframe.contentDocument.getElementById("clear-seller-signature");
      if (clearBtn) clearBtn.addEventListener("click", () => {
        sellerPad!.clear();
        updateSellerPadClass();
      });
    }
    // Khởi tạo signature pad cho buyer
    const buyerPadDiv = iframe.contentDocument.getElementById("buyer-signature-pad");
    const buyerCanvas = iframe.contentDocument.getElementById("buyer-signature-canvas") as HTMLCanvasElement | null;
    let buyerPad: SignaturePad | null = null;
    if (buyerCanvas) {
      buyerPad = new SignaturePad(buyerCanvas, { backgroundColor: "#fff" });
      const updateBuyerPadClass = () => {
        if (buyerPadDiv) {
          if (buyerPad && !buyerPad.isEmpty()) {
            buyerPadDiv.classList.add("has-signature");
          } else {
            buyerPadDiv.classList.remove("has-signature");
          }
        }
      };
      // Listen for drawing events to update pad class
      buyerCanvas.addEventListener("mouseup", updateBuyerPadClass);
      buyerCanvas.addEventListener("touchend", updateBuyerPadClass);
      buyerCanvas.addEventListener("mousedown", updateBuyerPadClass);
      buyerCanvas.addEventListener("touchstart", updateBuyerPadClass);
      updateBuyerPadClass();
      const clearBtn = iframe.contentDocument.getElementById("clear-buyer-signature");
      if (clearBtn) clearBtn.addEventListener("click", () => {
        buyerPad!.clear();
        updateBuyerPadClass();
      });
    }
    // Lưu chữ ký vào DB khi nhấn nút lưu hợp đồng
    (window as Window & { getSignatures?: () => { seller: string | null; buyer: string | null } }).getSignatures = () => ({
      seller: sellerPad && !sellerPad.isEmpty() ? sellerPad.toDataURL() : null,
      buyer: buyerPad && !buyerPad.isEmpty() ? buyerPad.toDataURL() : null,
    });
    // Thêm logic cho nút thêm điều khoản phụ (đồng bộ id với template)
    const addTermBtn = iframe.contentDocument.getElementById("add-extra-term-btn");
    const extraTermsList = iframe.contentDocument.getElementById("extra-terms-list");
    if (addTermBtn && extraTermsList) {
      addTermBtn.addEventListener("click", () => {
        if (!iframe.contentDocument) return;
        const li = iframe.contentDocument.createElement("li");
        li.innerHTML = '<span contenteditable="true" style="padding:2px 8px;border-radius:4px;background:#fffbe6;border:1px solid #f59e42;">Điều khoản phụ mới...</span>';
        extraTermsList.appendChild(li);
      });
    }
  };

  const handleSaveContract = async () => {
    const iframe = iframeRef.current;
    const htmlDoc = iframe?.contentDocument;
    if (!htmlDoc) return toast.error("Không tìm thấy nội dung hợp đồng");

    // Clone the document to safely modify
    const docClone = htmlDoc.cloneNode(true) as Document;
    // Remove all buttons
    const buttons = docClone.querySelectorAll("button");
    buttons.forEach((btn) => btn.parentNode?.removeChild(btn));
    // Remove all contenteditable attributes
    const editableEls = docClone.querySelectorAll("[contenteditable]");
    editableEls.forEach((el) => el.removeAttribute("contenteditable"));
    // Build cleaned HTML
    const newHtml = "<!DOCTYPE html>\n" + docClone.documentElement.outerHTML;

    try {
      setLoading(true);
      // Lấy chữ ký từ window.getSignatures
      const win = window as Window & { getSignatures?: () => { seller: string | null; buyer: string | null } };
      const signatures = win.getSignatures ? win.getSignatures() : { seller: null, buyer: null };
      await productServices.updateContractTemplate(productId!, {
        htmlContent: newHtml,
        sellerSignature: signatures.seller,
        // @ts-expect-error: allow buyerSignature for backend
        buyerSignature: signatures.buyer,
      });
      toast.success("Đã lưu hợp đồng có chữ ký");
      navigate(-1);
    } catch {
      toast.error("Lưu hợp đồng thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);

      const iframe = iframeRef.current;
      const htmlDoc = iframe?.contentDocument;
      if (!htmlDoc) return toast.error("Không có nội dung để xuất PDF");

      const paper = htmlDoc.querySelector(".paper");
      if (!paper) return toast.error("Không tìm thấy nội dung hợp đồng");

      // Tạo bản sao DOM ẩn để render đầy đủ nội dung (kể cả ngoài viewport)
      const container = document.createElement("div");
      container.appendChild(paper.cloneNode(true));
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = paper.scrollWidth + "px";
      document.body.appendChild(container);

      // Copy chữ ký canvas sang bản sao, nếu có chữ ký thì thay bằng ảnh, nếu chưa ký thì giữ nguyên canvas
      const copySignature = (origId: string, padDivId: string) => {
        const origCanvas = paper.querySelector(`#${origId}`) as HTMLCanvasElement | null;
        const cloneCanvas = container.querySelector(`#${origId}`) as HTMLCanvasElement | null;
        const origPadDiv = paper.querySelector(`#${padDivId}`);
        const clonePadDiv = container.querySelector(`#${padDivId}`);
        if (origCanvas && cloneCanvas && origPadDiv && clonePadDiv) {
          // Nếu đã ký thì thay canvas bằng ảnh
          const isSigned = origPadDiv.classList.contains("has-signature");
          if (isSigned && !origCanvas.toDataURL().includes("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA")) { // not blank
            const img = document.createElement("img");
            img.src = origCanvas.toDataURL();
            img.className = "signature-img";
            img.style.maxWidth = "220px";
            img.style.maxHeight = "80px";
            clonePadDiv.replaceChild(img, cloneCanvas);
          } else {
            // Nếu chưa ký thì giữ nguyên canvas
            const ctx = cloneCanvas.getContext("2d");
            ctx?.drawImage(origCanvas, 0, 0);
          }
        }
      };
      copySignature("seller-signature-canvas", "seller-signature-pad");
      copySignature("buyer-signature-canvas", "buyer-signature-pad");

      // Render thành ảnh lớn
      const canvas = await html2canvas(container, {
        scale: 2, // tăng chất lượng
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: paper.scrollWidth,
        windowHeight: paper.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");

      // --- Xử lý chia nhiều trang PDF ---
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("hop-dong.pdf");
      document.body.removeChild(container);
      toast.success("Đã tải PDF thành công");
    } catch (err) {
      console.error(err);
      toast.error("Xuất PDF thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-center mb-4">HỢP ĐỒNG MUA BÁN</h2>
        <div className="contract-sheet border rounded overflow-visible p-6">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Đang tải...</div>
          ) : (
            <iframe
              ref={iframeRef}
              title="contract-preview"
              srcDoc={html}
              style={{ width: "100%", minHeight: 1200, border: "none" }}
              onLoad={handleIframeLoad}
            />
          )}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => navigate(-1)}>Quay lại</Button>
            <Button onClick={handleExportPDF} disabled={loading}>Xuất PDF</Button>
            <Button onClick={handleSaveContract} disabled={loading}>Lưu hợp đồng</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractEditorPage;
