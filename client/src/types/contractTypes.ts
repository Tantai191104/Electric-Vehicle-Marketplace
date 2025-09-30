export interface ContractInfo {
    contractNumber: string;
    seller: ContractParty;
    buyer: ContractParty;
    vehicle: VehicleInfo;
    price: number;
    priceInWords: string;
    signDate: string;
}

export interface ContractParty {
    name: string;
    idNumber: string;
    address?: string;
    phone?: string;
}

export interface VehicleInfo {
    name: string;
    plateNumber: string;
    year?: number;
    brand?: string;
    model?: string;
}

export const mockContractData: ContractInfo = {
    contractNumber: `HD${new Date().getTime()}`,
    seller: {
        name: "Nguyễn Văn A",
        idNumber: "123456789"
    },
    buyer: {
        name: "Trần Văn B",
        idNumber: "987654321"
    },
    vehicle: {
        name: "VinFast VF8 Plus 2024",
        plateNumber: "30A-12345"
    },
    price: 1200000000,
    priceInWords: "Một tỷ hai trăm triệu đồng",
    signDate: new Date().toLocaleDateString('vi-VN')
};