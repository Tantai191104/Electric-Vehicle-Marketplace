import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface PDFExportOptions {
  element: HTMLElement;
  filename?: string;
  quality?: number;
  scale?: number;
  returnBlob?: boolean;
}

export const exportToPDF = async ({
  element,
  filename = `document-${Date.now()}.pdf`,
  quality = 0.85,
  scale = 1.5,
  returnBlob = false,
}: PDFExportOptions): Promise<Blob | void> => {
  try {
    // Đảm bảo element có trong DOM và visible
    if (!document.body.contains(element)) {
      throw new Error("Element not found in DOM");
    }

    // Optimized html2canvas options với error handling
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "white",
      width: element.offsetWidth || 794,
      height: element.offsetHeight || element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      logging: false,
      removeContainer: false,
      foreignObjectRendering: false, // Disable to avoid iframe issues
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        // Ensure all styles are properly applied
        const clonedElement = clonedDoc.querySelector("body > div");
        if (clonedElement) {
          (clonedElement as HTMLElement).style.visibility = "visible";
          (clonedElement as HTMLElement).style.position = "static";
          (clonedElement as HTMLElement).style.left = "0";
          (clonedElement as HTMLElement).style.top = "0";
        }

        // Apply all inline styles to cloned elements
        applyInlineStylesToClone(clonedDoc);
      },
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error("Failed to create canvas from element");
    }

    const imgData = canvas.toDataURL("image/jpeg", quality);
    const pdf = createOptimizedPDF(canvas, imgData);

    if (returnBlob) {
      return pdf.output("blob");
    } else {
      pdf.save(filename);
    }
  } catch (error) {
    console.error("PDF Export Error:", error);
    throw new Error(
      `PDF export failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

const applyInlineStylesToClone = (clonedDoc: Document): void => {
  const allElements = clonedDoc.querySelectorAll("*");

  allElements.forEach((element) => {
    const htmlElement = element as HTMLElement;

    // Ensure visibility
    if (htmlElement.style.visibility === "hidden") {
      htmlElement.style.visibility = "visible";
    }

    // Fix positioning issues
    if (
      htmlElement.style.position === "absolute" &&
      htmlElement.style.left === "-9999px"
    ) {
      htmlElement.style.position = "static";
      htmlElement.style.left = "0";
    }
  });
};

const createOptimizedPDF = (
  canvas: HTMLCanvasElement,
  imgData: string
): jsPDF => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
    precision: 2,
  });

  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  addPagesOptimized(pdf, imgData, imgWidth, imgHeight, pageHeight);

  return pdf;
};

const addPagesOptimized = (
  pdf: jsPDF,
  imgData: string,
  imgWidth: number,
  imgHeight: number,
  pageHeight: number
): void => {
  let heightLeft = imgHeight;
  let position = 0;
  let isFirstPage = true;

  while (heightLeft > 0) {
    if (!isFirstPage) {
      pdf.addPage();
    }

    pdf.addImage(
      imgData,
      "JPEG",
      0,
      position,
      imgWidth,
      Math.min(imgHeight, pageHeight),
      undefined,
      "FAST"
    );

    heightLeft -= pageHeight;
    position = heightLeft > 0 ? -pageHeight : position;
    isFirstPage = false;
  }
};
