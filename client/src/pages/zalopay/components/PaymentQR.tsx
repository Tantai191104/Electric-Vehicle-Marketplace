import { QRCodeCanvas } from "qrcode.react";

type PaymentQRProps = {
    orderUrl: string | null;
};

const PaymentQR: React.FC<PaymentQRProps> = ({ orderUrl }) => {
    if (!orderUrl) return null;

    return (
        <div className="flex flex-col items-center gap-4">
            <QRCodeCanvas value={orderUrl} size={220} />
            <a
                href={orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
            >
                Mở trực tiếp trong ZaloPay
            </a>
        </div>
    );
};

export default PaymentQR;
