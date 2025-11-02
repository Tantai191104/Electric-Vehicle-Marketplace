import { useState, useEffect } from "react";
import { orderServices } from "@/services/orderServices";
import type { ShippingFeePayload } from "@/types/shippingType";

interface Address {
    districtCode?: string | null;
    wardCode?: string | null;
}

interface Seller {
    address?: Address;
}

interface Product {
    category?: string;
    width?: number;
    length?: number;
    height?: number;
    weight?: number;
    price?: number;
    seller?: Seller;
}

interface UserProfile {
    address?: Address;
}

interface User {
    profile?: UserProfile;
}

interface ShippingInfo {
    fullName?: string;
    phone?: string;
    email?: string;
    houseNumber?: string;
    city?: string;
    district?: string;
    ward?: string;
}

export function useShippingFee(
    product: Product | undefined,
    user: User | undefined | null,
    shippingInfo: ShippingInfo
) {
    const [shippingFee, setShippingFee] = useState<number>(0);

    useEffect(() => {
        async function fetchShippingFee() {
            if (!product || !user) return;
            
            let fee = 0;
            
            if (product.category === "vehicle") {
                fee = 500000;
            } else {
                const toDistrictCode = user?.profile?.address?.districtCode || "";
                const toWardCode = user?.profile?.address?.wardCode || "";
                const fromDistrictCode = product.seller?.address?.districtCode || "";
                const fromWardCode = product.seller?.address?.wardCode || "";
                
                const payload: ShippingFeePayload = {
                    service_type_id: 2,
                    from_district_id: Number(fromDistrictCode) || 0,
                    from_ward_code: fromWardCode,
                    to_district_id: Number(toDistrictCode) || 0,
                    to_ward_code: toWardCode,
                    width: product.width || 0,
                    length: product.length || 0,
                    height: product.height || 0,
                    weight: product.weight || 0,
                    insurance_value: product.price || 0,
                    coupon: null,
                };
                
                try {
                    const result = await orderServices.getShippingFee(payload);
                    fee = result.data.total;
                } catch (error) {
                    console.error("Error fetching shipping fee:", error);
                    fee = 0;
                }
            }
            
            setShippingFee(fee);
        }
        
        fetchShippingFee();
    }, [product, user, shippingInfo]);

    return shippingFee;
}
