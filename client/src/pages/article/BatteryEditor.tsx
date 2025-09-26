import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { BatteryFormData } from "@/types/productType";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BasicInfoForm from "./components/BasicInfoForm";
import SpecificationsForm from "./components/SpecificationsForm";
import LocationForm from "./components/LocationForm";
import ImagesForm from "./components/ImagesForm";
import { Car, Bike, BatteryCharging } from "lucide-react";

const initialBatteryData: BatteryFormData = {
  title: "",
  description: "",
  price: 0,
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  specifications: {
    batteryCapacity: "",
    range: "",
    chargingTime: "",
    power: "",
    weight: "",
    dimensions: "",
  },
  location: {
    city: "",
    province: "",
    address: "",
  },
  images: [],
};

const CATEGORY_LIST = [
  { label: "Xe hơi điện", icon: <Car className="w-6 h-6" /> },
  { label: "Xe máy điện", icon: <Bike className="w-6 h-6" /> },
  { label: "Pin xe điện", icon: <BatteryCharging className="w-6 h-6" /> },
];

const BatteryEditor: React.FC = () => {
  const [form, setForm] = useState<BatteryFormData>(initialBatteryData);
  const [showTypeDialog, setShowTypeDialog] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const handleSubmit = () => {
    console.log("Submitting battery data:", form);
    toast.success("Đăng tin pin thành công!");
  };

  return (
    <div className="min-h-screen flex justify-center py-12 px-4 mt-[80px] bg-gray-50">
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
                  onClick={() => setShowTypeDialog(false)}
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

      {/* Layout 2 cột: Trái là ảnh/video, phải là form */}
      <div className="w-full max-w-5xl bg-white/95 p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-8">Đăng tin pin xe điện</h2>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cột trái: Hình ảnh & video */}
          <div className="md:w-1/3 w-full">
            <ImagesForm images={images} setImages={setImages} label="Ảnh sản phẩm" maxImages={6} />
          </div>
          {/* Cột phải: Các form còn lại */}
          <div className="md:w-2/3 w-full flex flex-col gap-6">
            <BasicInfoForm form={form} setForm={setForm} />
            <SpecificationsForm form={form} setForm={setForm} />
            <LocationForm form={form} setForm={setForm} />
            <Button className="w-full py-3 mt-2" onClick={handleSubmit}>
              Đăng tin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryEditor;
