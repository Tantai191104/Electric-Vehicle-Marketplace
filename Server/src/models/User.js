import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const provinces = JSON.parse(fs.readFileSync(path.join(__dirname, "../constants/location/provinces.json"), "utf8"));
const districts = JSON.parse(fs.readFileSync(path.join(__dirname, "../constants/location/districts.json"), "utf8"));
const wards = JSON.parse(fs.readFileSync(path.join(__dirname, "../constants/location/wards.json"), "utf8"));

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, default: null },
    avatar: { type: String, default: null },
    role: { type: String, enum: ["customer", "staff", "admin"], default: "customer" },
    isActive: { type: Boolean, default: true },
    
    profile: {
      fullName: { type: String, default: null },
      dateOfBirth: { type: Date, default: null },
      gender: { type: String, enum: ["male", "female", "other"], default: null },
      address: {
        houseNumber: { type: String, default: null },
        provinceCode: { type: String, default: null },
        districtCode: { type: String, default: null },
        wardCode: { type: String, default: null },
        province: { type: String, default: null },
        district: { type: String, default: null },
        ward: { type: String, default: null }
      },
      identityCard: { type: String, default: null },
      bankAccount: {
        bankName: { type: String, default: null },
        accountNumber: { type: String, default: null },
        accountHolder: { type: String, default: null }
      }
    },
    
    wallet: {
      balance: { type: Number, default: 0 }, 
      totalDeposited: { type: Number, default: 0 }, 
      totalSpent: { type: Number, default: 0 } 
    },
    
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true }
      },
      language: { type: String, default: "vi" },
      currency: { type: String, default: "VND" }
    },
    
    
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

// Validate and map location codes before saving if provided
userSchema.pre("save", function(next) {
  try {
    const addr = this.profile?.address;
    if (!addr) return next();

    // Only allow free text for houseNumber; codes must exist in datasets
    if (addr.provinceCode || addr.districtCode || addr.wardCode) {
      const province = provinces.find((p) => String(p.Code) === String(addr.provinceCode) || String(p.ProvinceID) === String(addr.provinceCode));
      if (!province) throw new Error("Invalid provinceCode");

      const district = districts.find((d) => (String(d.DistrictID) === String(addr.districtCode) || String(d.Code || '') === String(addr.districtCode)) && Number(d.ProvinceID) === Number(province.ProvinceID));
      if (!district) throw new Error("Invalid districtCode for selected province");

      const ward = wards.find((w) => String(w.WardCode) === String(addr.wardCode) && Number(w.DistrictID) === Number(district.DistrictID));
      if (!ward) throw new Error("Invalid wardCode for selected district");

      this.profile.address.province = province.ProvinceName;
      this.profile.address.district = district.DistrictName;
      this.profile.address.ward = ward.WardName;
    }
    next();
  } catch (e) {
    next(e);
  }
});
