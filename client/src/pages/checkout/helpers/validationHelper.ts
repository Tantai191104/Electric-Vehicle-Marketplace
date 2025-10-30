import type { ShippingInfo } from "../components/ShippingInfoStep";

export function validateShippingInfo(info: ShippingInfo): boolean {
    return !!(
        info.fullName?.trim() &&
        info.phone?.trim() &&
        info.email?.trim() &&
        info.houseNumber?.trim() &&
        info.city &&
        info.district &&
        info.ward &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email) &&
        /^[0-9\s\-+()]{10,}$/.test(info.phone)
    );
}

export function validateStep(
    step: number,
    shippingInfo: ShippingInfo,
    selectedPaymentMethod: string,
    category?: string
): boolean {
    if (category === "battery") {
        switch (step) {
            case 1:
                return true;
            case 2:
                return validateShippingInfo(shippingInfo);
            case 3:
                return selectedPaymentMethod !== '';
            case 4:
            case 5:
                return true;
            default:
                return false;
        }
    } else {
        switch (step) {
            case 1:
                return true;
            case 2:
                return validateShippingInfo(shippingInfo);
            case 3:
                return selectedPaymentMethod !== '';
            case 4:
                return true;
            default:
                return false;
        }
    }
}
