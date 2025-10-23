import { toast } from "sonner";
import { exportToPDF } from "@/utils/pdfExport";

/**
 * Generate PDF from contract HTML
 */
export async function generateContractPDF(contractHtml: string): Promise<File | null> {
    try {
        // Tạo một div tạm để render HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = contractHtml;
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-9999px";
        tempDiv.style.width = "794px"; // A4 width
        document.body.appendChild(tempDiv);

        // Generate PDF blob
        const blob = await exportToPDF({
            element: tempDiv,
            filename: `contract-${Date.now()}.pdf`,
            quality: 0.95,
            scale: 2,
            returnBlob: true,
        }) as Blob;

        // Remove temp div
        document.body.removeChild(tempDiv);

        if (!blob) {
            throw new Error("Failed to generate PDF blob");
        }

        // Convert blob to File
        const file = new File([blob], `contract-${Date.now()}.pdf`, {
            type: "application/pdf",
        });

        return file;
    } catch (error) {
        console.error("Error generating contract PDF:", error);
        toast.error("Không thể tạo file PDF hợp đồng");
        return null;
    }
}
