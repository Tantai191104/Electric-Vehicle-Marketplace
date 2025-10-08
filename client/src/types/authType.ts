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

// Violation type
export type Violation = {
  type: "spam" | "fake_product" | "fraud" | "inappropriate" | "other";
  description: string;
  severity: "low" | "medium" | "high";
  action: "warning" | "suspension" | "ban";
  status: "pending" | "resolved";
  reportedBy?: string; // userId
  reportedAt: string;
  resolvedBy?: string; // userId
  resolvedAt?: string;
  adminNotes?: string;
};

// Suspension type
export type Suspension = {
  reason?: string;
  suspendedAt?: string;
  suspendedBy?: string; // userId
  expiresAt?: string;
};

// Profile type
export type Profile = {
  fullName: string | null;
  dateOfBirth: string | null;
  gender: "male" | "female" | "other" | null;
  address: Address;
  identityCard: string | null;
  bankAccount: BankAccount;
  violations: Violation[];
  suspension?: Suspension;
};

// User type
export type User = {
  _id?: string;
  name: string;
  email: string;
  password?: string; // select: false
  phone?: string | null;
  avatar: string | null;
  role: "user" | "admin" | string; // có thể mở rộng
  isActive: boolean;
  profile: Profile;
  wallet: Wallet;
  preferences: Preferences;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};
