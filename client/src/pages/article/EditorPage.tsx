import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { contractServices } from "@/services/contractServices";

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
  const [form, setForm] = useState<VehicleFormData | BatteryFormData | null>(null);
  const [showTypeDialog, setShowTypeDialog] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleCategorySelect = (category: "vehicle" | "battery") => {
    if (category === "vehicle") {
      setForm(initialVehicleData);
    } else {
      setForm(initialBatteryData);
    }
    setShowTypeDialog(false);
  };

  const handleSubmit = async () => {
    try {
      console.log("Submitting data:", form);
      if (!form) return;

      // gọi API
      const res = await productServices.createProduct(form);
      console.log("API response:", res);

      if (form?.category === "vehicle") {
        toast.success("Đăng tin xe điện thành công!");
      } else {
        toast.success("Đăng tin pin thành công!");

        // Nếu là battery, tạo hợp đồng (server sẽ khởi tạo bản nháp hợp đồng)
        try {
          const productData = res?.data || res;
          const productId = productData?._id || productData?.id || productData?.productId;
          const sellerId = productData?.seller?.id || productData?.seller?._id || productData?.sellerId;

          if (!productId) {
            console.warn('Product id not found in createProduct response; skipping contract creation');
          } else {
            const contractResp = await contractServices.createContract({ product_id: productId, seller_id: sellerId });
            const newContractId = contractResp?.data?.contractId;
            if (newContractId) {
              toast.success("Hợp đồng đã được tạo cho pin", {
                description: `Mã hợp đồng: HD${newContractId}`,
              });
              // Navigate to contract page to allow editing/signing
              navigate('/contract', { state: { product: productData, seller: productData?.seller } });
            }
          }
        } catch (err) {
          console.error('Could not create contract after battery creation', err);
          toast.error('Tạo hợp đồng không thành công, vui lòng thử lại sau');
        }
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Có lỗi xảy ra khi đăng tin!");
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 mt-[120px]">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative z-10 flex justify-center">
        {/* Popup chọn loại sản phẩm */}
        <Dialog open={showTypeDialog} onOpenChange={setShowTypeDialog}>
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
                <BasicInfoForm form={form} setForm={setForm} />

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
      </div>
    </div>
  );
};

export default EditorPage;
