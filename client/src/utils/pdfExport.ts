import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface PDFExportOptions {
    element: HTMLElement;
    filename?: string;
    quality?: number;
    scale?: number;
}

export const exportToPDF = async ({
    element,
    filename = `document-${Date.now()}.pdf`,
    quality = 0.95,
    scale = 2
}: PDFExportOptions): Promise<void> => {
    // Tạo container tạm với style an toàn
    const tempContainer = createTempContainer();
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Áp dụng styles an toàn cho PDF
    applyPDFSafeStyles(clonedElement);
    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);

    try {
        // Đợi DOM render
        await new Promise(resolve => setTimeout(resolve, 300));

        // Tạo canvas
        const canvas = await html2canvas(tempContainer, {
            scale,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "white",
            width: 794,
            height: tempContainer.scrollHeight,
            scrollX: 0,
            scrollY: 0,
            logging: false,
            removeContainer: false
        });

        const imgData = canvas.toDataURL('image/jpeg', quality);
        
        // Tạo PDF với multi-page support
        const pdf = createPDFFromCanvas(canvas, imgData);
        pdf.save(filename);

    } finally {
        // Cleanup
        if (document.body.contains(tempContainer)) {
            document.body.removeChild(tempContainer);
        }
    }
};

const createTempContainer = (): HTMLDivElement => {
    const container = document.createElement("div");
    container.style.cssText = `
        position: absolute;
        left: -9999px;
        top: 0;
        width: 794px;
        background: white;
        font-family: Arial, sans-serif;
        color: black;
        line-height: 1.6;
        padding: 40px;
        box-sizing: border-box;
    `;
    return container;
};

const createPDFFromCanvas = (canvas: HTMLCanvasElement, imgData: string): jsPDF => {
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Thêm trang đầu
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Thêm các trang tiếp theo
    while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
    }

    return pdf;
};

const applyPDFSafeStyles = (element: HTMLElement): void => {
    // Reset root element
    element.style.cssText = `
        background: white;
        color: black;
        font-family: Arial, sans-serif;
        line-height: 1.6;
        padding: 0;
        margin: 0;
    `;

    // Xóa tất cả buttons
    const buttons = element.querySelectorAll('button');
    buttons.forEach(button => button.remove());

    // Áp dụng styles cho từng element
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el: Element) => {
        const htmlEl = el as HTMLElement;
        applyElementStyles(htmlEl);
    });
};

const applyElementStyles = (element: HTMLElement): void => {
    // Reset style
    element.style.cssText = '';

    // Typography styles
    if (element.classList.contains('text-3xl')) {
        element.style.cssText = 'font-size: 30px; font-weight: bold; color: black; text-align: center; margin: 0 0 8px 0;';
    } else if (element.classList.contains('text-lg')) {
        element.style.cssText = 'font-size: 18px; font-weight: 600; color: black; margin: 0 0 16px 0;';
    } else if (element.classList.contains('text-sm')) {
        element.style.cssText = 'font-size: 14px; color: #666666;';
    } else if (element.classList.contains('text-xs')) {
        element.style.cssText = 'font-size: 12px; color: #888888;';
    }

    // Table styles
    applyTableStyles(element);
    
    // Layout styles
    applyLayoutStyles(element);
    
    // Text alignment
    if (element.classList.contains('text-center')) {
        element.style.textAlign = 'center';
    }

    // Font weights
    if (element.classList.contains('font-bold') || element.tagName === 'STRONG') {
        element.style.fontWeight = 'bold';
    }
    if (element.classList.contains('font-semibold')) {
        element.style.fontWeight = '600';
    }

    // Margins
    applyMarginStyles(element);

    // Remove problematic positioning
    if (element.classList.contains('relative')) {
        element.style.position = 'static';
    }
};

const applyTableStyles = (element: HTMLElement): void => {
    if (element.tagName === 'TABLE') {
        element.style.cssText = 'width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;';
    } else if (element.tagName === 'TD') {
        let tdStyle = 'padding: 12px; border: 1px solid #cccccc; vertical-align: top;';
        
        if (element.classList.contains('font-semibold') || element.classList.contains('bg-gray-50')) {
            tdStyle += ' font-weight: 600; background: #f9f9f9;';
        }
        if (element.classList.contains('text-green-600')) {
            tdStyle += ' color: #16a34a; font-weight: 600;';
        }
        
        element.style.cssText = tdStyle;
    }
};

const applyLayoutStyles = (element: HTMLElement): void => {
    // Background styles
    if (element.classList.contains('bg-gray-50')) {
        element.style.cssText = 'background: #f9f9f9; padding: 16px; margin: 8px 0; border-radius: 8px;';
    }

    // Grid layouts
    if (element.classList.contains('grid-cols-2')) {
        element.style.cssText = 'display: flex; gap: 32px; margin: 48px 0 0 0;';
    }
    if (element.closest('.grid-cols-2') && element !== element.closest('.grid-cols-2')) {
        element.style.cssText = 'flex: 1; text-align: center;';
    }

    // Space between children
    if (element.classList.contains('space-y-4')) {
        element.style.display = 'block';
        Array.from(element.children).forEach((child, index) => {
            if (index > 0) {
                (child as HTMLElement).style.marginTop = '16px';
            }
        });
    }
};

const applyMarginStyles = (element: HTMLElement): void => {
    if (element.classList.contains('mb-8')) element.style.marginBottom = '32px';
    if (element.classList.contains('mb-4')) element.style.marginBottom = '16px';
    if (element.classList.contains('mb-2')) element.style.marginBottom = '8px';
    if (element.classList.contains('mt-12')) element.style.marginTop = '48px';
    if (element.classList.contains('mt-2')) element.style.marginTop = '8px';
};