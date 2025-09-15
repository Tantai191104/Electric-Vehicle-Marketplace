import mongoose from "mongoose";

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
