// components/CardFormRow.tsx
import React from "react";

type CardFormRowProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

const CardFormRow: React.FC<CardFormRowProps> = ({ label, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-yellow-900 font-medium">{label}</label>
    {children}
    {error && <p className="text-red-600 text-sm">{error}</p>}
  </div>
);

export default CardFormRow;
