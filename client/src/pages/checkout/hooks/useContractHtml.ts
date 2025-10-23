import { useState, useEffect } from "react";
import { updateContractHtml } from "../helpers/contractHelper";

interface Address {
  houseNumber?: string | null;
  ward?: string | null;
  district?: string | null;
  province?: string | null;
}

interface Seller {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: Address | null;
}

interface ContractTemplate {
  htmlContent?: string | null;
  sellerSignature?: string | null;
}

interface Product {
  price?: number;
  contractTemplate?: ContractTemplate | null;
  seller?: Seller;
  category?: string;
}

interface UserProfile {
  address?: Address;
}

interface User {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  profile?: UserProfile | null;
}

export function useContractHtml(
  product: Product | undefined,
  currentStep: number,
  buyerSignature: string,
  user: User | undefined | null,
  shippingFee: number
) {
  const [contractHtml, setContractHtml] = useState<string>("");

  useEffect(() => {
    if (product && product.contractTemplate?.htmlContent && currentStep === 4) {
      const totalPrice = (product.price || 0) + (shippingFee || 0);

      console.log('🔍 Contract HTML Debug:', {
        hasSellerSignature: !!product.contractTemplate.sellerSignature,
        hasBuyerSignature: !!buyerSignature,
        sellerSignaturePreview: product.contractTemplate.sellerSignature?.substring(0, 50),
        buyerSignaturePreview: buyerSignature?.substring(0, 50),
      });

      const html = updateContractHtml(
        product.contractTemplate.htmlContent || "",
        {
          sellerSignature:
            product.contractTemplate.sellerSignature || undefined,
          buyerSignature,
          buyerName: user?.name,
          totalPrice,
          shippingFee,
          seller: {
            name: product.seller?.name || "",
            email: product.seller?.email || "",
            phone: product.seller?.phone || "",
            address: {
              houseNumber: product.seller?.address?.houseNumber || "",
              ward: product.seller?.address?.ward || "",
              district: product.seller?.address?.district || "",
              province: product.seller?.address?.province || "",
            },
          },
          buyer: {
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            address: {
              houseNumber: user?.profile?.address?.houseNumber || "",
              ward: user?.profile?.address?.ward || "",
              district: user?.profile?.address?.district || "",
              province: user?.profile?.address?.province || "",
            },
          },
        }
      );

      setContractHtml(html);
    } else if (currentStep !== 4) {
      setContractHtml("");
    }
  }, [product, currentStep, buyerSignature, user, shippingFee]);

  return contractHtml;
}
