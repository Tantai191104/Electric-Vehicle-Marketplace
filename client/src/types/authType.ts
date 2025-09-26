// Address type
export type Address = {
  houseNumber: string | null;
  provinceCode: string | null;
  districtCode: string | null;
  wardCode: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
};

// Bank account type
export type BankAccount = {
  bankName: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
};

// Wallet type
export type Wallet = {
  balance: number;
  totalDeposited: number;
  totalSpent: number;
};

// Notification preferences type
export type NotificationPreferences = {
  email: boolean;
  sms: boolean;
  push: boolean;
};

// Preferences type
export type Preferences = {
  notifications: NotificationPreferences;
  language: string;
  currency: string;
};

// Profile type
export type Profile = {
  address: Address;
  bankAccount: BankAccount;
  fullName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  identityCard: string | null;
};

// User type
export type User = {
  profile: Profile;
  wallet: Wallet;
  preferences: Preferences;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string | null;
  role: "customer" | "admin" | string; // có thể mở rộng
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
};
