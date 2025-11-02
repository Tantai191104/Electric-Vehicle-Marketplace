import React, { useState } from "react";
import PostSuccessDialog from "./components/PostSuccessDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { VehicleFormData, BatteryFormData } from "@/types/productType";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BasicInfoForm from "./components/BasicInfoForm";
import VehicleSpecificationsForm from "./components/VehicleSpecificationsForm";
import BatterySpecificationsForm from "./components/BatterySpecificationsForm";
import LocationForm from "./components/LocationForm";
import ImagesForm from "./components/ImagesForm";
import { Car, Bike, BatteryCharging } from "lucide-react";
import { productServices } from "@/services/productServices";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { DialogContent as DialogContent2, DialogHeader as DialogHeader2, DialogTitle as DialogTitle2 } from "@/components/ui/dialog";

const initialVehicleData: VehicleFormData = {
  title: "",
  description: "",
  price: 0,
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  category: "vehicle",
  specifications: {
    batteryCapacity: "",
    range: "",
    chargingTime: "",
    power: "",
    maxSpeed: "",
    motorType: "",
    batteryType: "",
    voltage: "",
    warranty: "",
    compatibility: "",
  },
  location: {
    city: "",
    province: "",
    address: "",
  },
  images: [],
  length: undefined,
  width: undefined,
  height: undefined,
  weight: undefined,
};

const initialBatteryData: BatteryFormData = {
  title: "",
  description: "",
  price: 0,
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  category: "battery",
  specifications: {
    batteryCapacity: "",
    voltage: "",
    capacity: "",
    cycleLife: "",
    chargingTime: "",
    operatingTemperature: "",
    weight: "",
    dimensions: "",
    warranty: "",
    compatibility: "",
  },
  location: {
    city: "",
    province: "",
    address: "",
  },
  images: [],
  length: undefined,
  width: undefined,
  height: undefined,
  weight: undefined,
};

const CATEGORY_LIST = [
  { label: "Xe hơi điện", icon: <Car className="w-6 h-6" />, category: "vehicle" as const },
  { label: "Xe máy điện", icon: <Bike className="w-6 h-6" />, category: "vehicle" as const },
  { label: "Pin xe điện", icon: <BatteryCharging className="w-6 h-6" />, category: "battery" as const },
];

const EditorPage: React.FC = () => {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [form, setForm] = useState<VehicleFormData | BatteryFormData | null>(null);
  const [showTypeDialog, setShowTypeDialog] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [contractHtml, setContractHtml] = useState<string>("");
  const [extraTerms, setExtraTerms] = useState<string>("");
  const [showSourceEditor, setShowSourceEditor] = useState<boolean>(false);
  const [sellerSignatureDataUrl, setSellerSignatureDataUrl] = useState<string | null>(null);
  const [buyerSignatureDataUrl, setBuyerSignatureDataUrl] = useState<string | null>(null);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [priceAnalysis, setPriceAnalysis] = useState<{
    priceRange?: { low: number; recommended: number; high: number };
    reasoning?: { low: string; recommended: string; high: string };
    marketAnalysis?: string;
    factors?: string[];
    tips?: string[];
    warnings?: string[];
  } | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleCategorySelect = (category: "vehicle" | "battery") => {
    if (category === "vehicle") {
      setForm(initialVehicleData);
    } else {
      setForm(initialBatteryData);
    }
    setShowTypeDialog(false);
  };

  const handleGetPriceSuggestion = async () => {
    if (!form) return;
    
    // Validate required fields
    const requiredFields = ['title', 'brand', 'model', 'year'];
    const missingFields = requiredFields.filter(field => !form[field as keyof typeof form]);
    
    if (missingFields.length > 0) {
      toast.error("Vui lòng điền đầy đủ thông tin cơ bản (Tiêu đề, Thương hiệu, Model, Năm) để nhận gợi ý giá");
      return;
    }

    setIsLoadingPrice(true);
    try {
      const priceData = await productServices.suggestPrice(form);
      
      setSuggestedPrice(priceData.suggestedPrice);
      setPriceAnalysis({
        priceRange: priceData.priceRange,
        reasoning: priceData.reasoning,
        marketAnalysis: priceData.marketAnalysis,
        factors: priceData.factors,
        tips: priceData.tips,
        warnings: priceData.warnings,
      });
      
      // Auto-fill the recommended price
      setForm({ ...form, price: priceData.priceRange?.recommended || priceData.suggestedPrice });
      
      toast.success(`Gợi ý giá: ${(priceData.priceRange?.recommended || priceData.suggestedPrice).toLocaleString('vi-VN')} ₫`);
    } catch (error) {
      console.error("Error getting price suggestion:", error);
      toast.error("Không thể lấy gợi ý giá. Vui lòng thử lại sau.");
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log("Submitting data:", form);
      if (!form) return;

      // gọi API
      const res = await productServices.createProduct(form);
      console.log("API response:", res);

      // assume res.data._id or res.data.product._id depending on backend
      const productId = res?.data?._id || res?.data?.product?._id || res?.product?._id || res?._id;

      if (form?.category === "vehicle") {
        toast.success("Đăng tin xe điện thành công!");
        setShowSuccessDialog(true);
      } else {
        toast.success("Đăng tin pin thành công! Chuyển sang tạo hợp đồng...");
        setCreatedProductId(productId || null);
        navigate(`/contracts/edit/${productId}`);
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Có lỗi xảy ra khi đăng tin!");
    }
  };

  // removed single-signature helper; using per-input FileReader handlers inline

  const handleSaveContract = async () => {
    if (!createdProductId) return toast.error("Không tìm thấy sản phẩm để lưu hợp đồng");
    try {
      const assembleFinalHtml = (html: string, additions: string) => {
        const insertion = `\n<div class="section"><div class="title">ĐIỀU KHOẢN BỔ SUNG</div><div>${additions}</div></div>`;
        // try to insert before </body> if present, otherwise append
        const idx = html.lastIndexOf("</body>");
        if (idx !== -1) {
          return html.slice(0, idx) + insertion + html.slice(idx);
        }
        // fallback: append
        return html + insertion;
      };

      let finalHtml = assembleFinalHtml(contractHtml, extraTerms);

      // Build a signature section using current uploaded signatures (if any)
      const sellerDisplayName = user?.name || "…";
      const buyerDisplayName = "…";
      const signatureSection = `
<div class="section"><div class="title">CHỮ KÝ</div><div class="signatures">
  <div class="signBox">
    <div class="muted">ĐẠI DIỆN BÊN A</div>
    <div style="height:80px;margin-top:12px">${sellerSignatureDataUrl ? `<img src="${sellerSignatureDataUrl}" style="max-height:80px" />` : ''}</div>
    <div class="name">${sellerDisplayName}</div>
  </div>
  <div class="signBox">
    <div class="muted">ĐẠI DIỆN BÊN B</div>
    <div style="height:80px;margin-top:12px">${buyerSignatureDataUrl ? `<img src="${buyerSignatureDataUrl}" style="max-height:80px" />` : ''}</div>
    <div class="name">${buyerDisplayName}</div>
  </div>
</div></div>`;

      // insert signatureSection before </body>
      const bodyIdx = finalHtml.lastIndexOf("</body>");
      if (bodyIdx !== -1) {
        finalHtml = finalHtml.slice(0, bodyIdx) + signatureSection + finalHtml.slice(bodyIdx);
      } else {
        finalHtml = finalHtml + signatureSection;
      }

      await productServices.updateContractTemplate(createdProductId, {
        htmlContent: finalHtml,
        sellerSignature: sellerSignatureDataUrl || null,
      });
      toast.success("Đã lưu hợp đồng thành công");
      setShowContractDialog(false);
    } catch (err) {
      console.error(err);
      toast.error("Lưu hợp đồng thất bại");
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 mt-[120px]">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative z-10 flex justify-center">
        {/* Popup chọn loại sản phẩm */}
        <Dialog
          open={showTypeDialog}
          onOpenChange={(open) => {
            setShowTypeDialog(open);
            if (!open && !form) setForm(initialBatteryData);
          }}
        >
          <DialogContent className="sm:max-w-md md:max-w-xl rounded-2xl p-0 overflow-hidden bg-white shadow-2xl">
            <div className="border-b px-6 py-4 bg-gray-50">
              <DialogHeader>
                <DialogTitle className="text-center text-xl font-bold text-gray-900">Đăng tin</DialogTitle>
              </DialogHeader>
            </div>
            <div className="px-6 pt-4 pb-2">
              <div className="font-semibold text-gray-700 text-sm mb-3">CHỌN DANH MỤC</div>
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto scrollbar-none">
                {CATEGORY_LIST.map((cat) => (
                  <button
                    key={cat.label}
                    className="flex items-center justify-between px-4 py-4 rounded-xl hover:bg-yellow-50 transition group border border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    onClick={() => handleCategorySelect(cat.category)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-yellow-100 text-yellow-700 rounded-xl p-3 group-hover:bg-yellow-200 transition">{cat.icon}</span>
                      <span className="font-semibold text-gray-900 text-base">{cat.label}</span>
                    </div>
                    <span className="text-gray-400 group-hover:text-yellow-500 transition">
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Layout cải tiến */}
        {form && (
          <div className="w-full max-w-7xl mx-auto">
            {/* Dropdown to change category */}
            <div className="flex justify-end mb-6">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Danh mục:</span>
                <select
                  value={form.category}
                  onChange={e => {
                    const cat = e.target.value;
                    if (cat === "vehicle") {
                      setForm(initialVehicleData);
                    } else {
                      setForm(initialBatteryData);
                    }
                  }}
                  className="rounded-xl border border-gray-300 px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                >
                  <option value="vehicle">Xe điện</option>
                  <option value="battery">Pin xe điện</option>
                </select>
              </div>
            </div>
            {/* Header với gradient đẹp */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-500 rounded-3xl shadow-2xl">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  {form.category === "vehicle" ? (
                    <Car className="w-8 h-8 text-white" />
                  ) : (
                    <BatteryCharging className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">
                    {form.category === "vehicle" ? "Đăng tin xe điện" : "Đăng tin pin xe điện"}
                  </h1>
                  <p className="text-yellow-100 mt-2">
                    {form.category === "vehicle"
                      ? "Chia sẻ chiếc xe điện của bạn với cộng đồng"
                      : "Chia sẻ pin xe điện chất lượng cao"
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cột trái: Hình ảnh */}
              <div className="lg:w-1/3 w-full">
                <div className="sticky top-24">
                  <ImagesForm images={images} setImages={setImages} label="Hình ảnh sản phẩm" maxImages={8} />
                </div>
              </div>

              {/* Cột phải: Forms */}
              <div className="lg:w-2/3 w-full space-y-8">
                <BasicInfoForm 
                  form={form} 
                  setForm={setForm}
                  onGetPriceSuggestion={handleGetPriceSuggestion}
                  isLoadingPrice={isLoadingPrice}
                  suggestedPrice={suggestedPrice}
                  priceAnalysis={priceAnalysis}
                />

                {form.category === "vehicle" ? (
                  <VehicleSpecificationsForm form={form as VehicleFormData} setForm={setForm as React.Dispatch<React.SetStateAction<VehicleFormData>>} />
                ) : (
                  <BatterySpecificationsForm form={form as BatteryFormData} setForm={setForm as React.Dispatch<React.SetStateAction<BatteryFormData>>} />
                )}

                <LocationForm form={form} setForm={setForm} />
              </div>
            </div>
          </div>
        )}

        {/* Contract dialog - reuse dialog UI */}
        <Dialog open={showContractDialog} onOpenChange={setShowContractDialog}>
          <DialogContent2 className="sm:max-w-3xl md:max-w-4xl rounded-2xl p-0 overflow-hidden bg-white shadow-2xl">
            <div className="border-b px-6 py-4 bg-gray-50">
              <DialogHeader2>
                <DialogTitle2 className="text-center text-xl font-bold text-gray-900">Tạo hợp đồng</DialogTitle2>
              </DialogHeader2>
            </div>
            <div className="px-6 pt-4 pb-6 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-700 text-sm mb-2">Xem trước hợp đồng</div>
                  <div className="flex items-center gap-2">
                    <button className="text-sm text-gray-500" onClick={() => setShowSourceEditor(false)}>Xem</button>
                    <button className="text-sm text-gray-500" onClick={() => setShowSourceEditor(true)}>Sửa nguồn</button>
                  </div>
                </div>

                {!showSourceEditor ? (
                  <div className="w-full h-96 p-3 border rounded overflow-auto bg-white">
                    {/* Rendered HTML preview with extra terms injected */}
                    <div dangerouslySetInnerHTML={{
                      __html: (function () {
                        const idx = contractHtml.lastIndexOf("</body>");
                        const insertion = `\n<div class="section"><div class="title">ĐIỀU KHOẢN BỔ SUNG</div><div>${extraTerms}</div></div>`;
                        if (idx !== -1) return contractHtml.slice(0, idx) + insertion + contractHtml.slice(idx);
                        return contractHtml + insertion;
                      })()
                    }} />
                  </div>
                ) : (
                  <textarea className="w-full h-48 p-3 border rounded" value={contractHtml} onChange={(e) => setContractHtml(e.target.value)} />
                )}
              </div>

              <div>
                <div className="font-semibold text-gray-700 text-sm mb-2">Thêm điều khoản bổ sung</div>
                <textarea className="w-full h-28 p-3 border rounded" value={extraTerms} onChange={(e) => setExtraTerms(e.target.value)} placeholder="Nhập điều khoản bổ sung..." />
              </div>

              <div>
                <div className="font-semibold text-gray-700 text-sm mb-2">Chữ ký</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-600">Bên bán (Người tạo)</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return setSellerSignatureDataUrl(null);
                        const reader = new FileReader();
                        reader.onload = () => setSellerSignatureDataUrl(String(reader.result || ""));
                        reader.readAsDataURL(f);
                      }}
                    />
                    {sellerSignatureDataUrl && <img src={sellerSignatureDataUrl} alt="seller signature preview" className="mt-3 max-h-32" />}
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-600">Bên mua</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return setBuyerSignatureDataUrl(null);
                        const reader = new FileReader();
                        reader.onload = () => setBuyerSignatureDataUrl(String(reader.result || ""));
                        reader.readAsDataURL(f);
                      }}
                    />
                    {buyerSignatureDataUrl && <img src={buyerSignatureDataUrl} alt="buyer signature preview" className="mt-3 max-h-32" />}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowContractDialog(false)}>Hủy</Button>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    // generate pdf from contract preview
                    try {
                      const idx = contractHtml.lastIndexOf("</body>");
                      const insertion = `\n<div class="section"><div class="title">ĐIỀU KHOẢN BỔ SUNG</div><div>${extraTerms}</div></div>`;
                      const htmlToRender = idx !== -1 ? contractHtml.slice(0, idx) + insertion + contractHtml.slice(idx) : contractHtml + insertion;
                      const container = document.createElement("div");
                      container.style.position = "fixed";
                      container.style.left = "-9999px";
                      container.innerHTML = htmlToRender;
                      document.body.appendChild(container);
                      const canvas = await html2canvas(container, { scale: 2 });
                      const imgData = canvas.toDataURL("image/png");
                      const pdf = new jsPDF({ unit: "pt", format: "a4" });
                      const pageWidth = pdf.internal.pageSize.getWidth();
                      // fit image
                      // @ts-expect-error - jsPDF typings don't expose getImageProperties on newer versions
                      const imgProps = pdf.getImageProperties(imgData);
                      const imgWidth = pageWidth;
                      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
                      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
                      const pdfBlob = pdf.output("blob");
                      const reader = new FileReader();
                      reader.onload = async () => {
                        const base64 = String(reader.result || "");
                        // base64 will be like 'data:application/pdf;base64,JVBERi0x...'
                        if (!createdProductId) {
                          toast.error("Không tìm thấy productId để lưu PDF");
                          document.body.removeChild(container);
                          return;
                        }
                        await productServices.updateContractTemplate(createdProductId, { pdfUrl: base64 });
                        toast.success("PDF đã được tạo và lưu");
                        document.body.removeChild(container);
                      };
                      reader.readAsDataURL(pdfBlob);
                    } catch (err) {
                      console.error(err);
                      toast.error("Tạo PDF thất bại");
                    }
                  }}
                >
                  Tạo PDF & Lưu
                </Button>
                <Button onClick={handleSaveContract}>Lưu hợp đồng</Button>
              </div>
            </div>
          </DialogContent2>
        </Dialog>

        {/* Nút đăng tin cố định */}
        {form && (
          <div className="fixed bottom-4 right-4 z-50">
            <Button
              className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              onClick={handleSubmit}
            >
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Đăng tin ngay
              </div>
            </Button>
          </div>
        )}

        <PostSuccessDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog} />
      </div>
    </div>
  );
};

export default EditorPage;
