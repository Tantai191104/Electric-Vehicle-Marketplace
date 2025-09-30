export interface Transaction {
  _id: string;
  userId: string;
  type: "deposit" | "withdrawal" | "payment" | "refund";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  reference: string;
  status: "completed" | "pending" | "failed" | "cancelled";
  paymentMethod: "wallet" | "e_wallet" | "bank_transfer" | "credit_card";
  metadata: {
    bankTransactionId?: string | null;
    orderId?: string | null;
    productId?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}