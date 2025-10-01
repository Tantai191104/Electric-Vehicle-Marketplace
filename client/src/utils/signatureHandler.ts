import SignatureCanvas from "react-signature-canvas";

export interface SignatureRefs {
  signer: React.RefObject<SignatureCanvas>;
}

export const replaceSignatureCanvasWithImages = async (
  clonedElement: HTMLElement,
  signatures: SignatureRefs
): Promise<void> => {
  try {
    // Find signature elements with better error handling
    const signerCanvas = clonedElement.querySelector(
      '[data-signature="signer"]'
    );

    if (signerCanvas) {
      console.log("Found signer canvas element");
      const signerSig = getOptimizedSignatureDataURL(signatures.signer);

      if (signerSig) {
        await replaceCanvasWithImageOptimized(signerCanvas, signerSig);
        console.log("Successfully replaced signer canvas with signature");
      } else {
        await replaceCanvasWithEmptyImageOptimized(signerCanvas);
        console.log("Replaced signer canvas with empty placeholder");
      }
    } else {
      console.warn(
        "Signer canvas element not found, looking for alternative selectors"
      );
      // Try alternative selectors
      const alternativeCanvas =
        clonedElement.querySelector("canvas") ||
        clonedElement.querySelector("[data-signature]");

      if (alternativeCanvas) {
        const signerSig = getOptimizedSignatureDataURL(signatures.signer);
        if (signerSig) {
          await replaceCanvasWithImageOptimized(alternativeCanvas, signerSig);
        } else {
          await replaceCanvasWithEmptyImageOptimized(alternativeCanvas);
        }
      }
    }
  } catch (error) {
    console.error("Error replacing signature canvas:", error);
    // Don't throw - continue with PDF generation even if signature replacement fails
  }
};

const getOptimizedSignatureDataURL = (
  sigRef: React.RefObject<SignatureCanvas>
): string | null => {
  try {
    if (!sigRef.current) {
      console.log("Signature ref is null");
      return null;
    }

    if (sigRef.current.isEmpty()) {
      console.log("Signature is empty");
      return null;
    }

    const canvas = sigRef.current.getCanvas();
    if (!canvas) {
      console.log("Canvas not found in signature ref");
      return null;
    }

    const dataURL = canvas.toDataURL("image/png", 0.8);
    console.log("Generated signature dataURL successfully");
    return dataURL;
  } catch (error) {
    console.error("Error getting signature dataURL:", error);
    return null;
  }
};

const replaceCanvasWithImageOptimized = async (
  canvas: Element,
  dataURL: string
): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      img.style.cssText = `
                width: 100%;
                height: 128px;
                border: 1px solid #cccccc;
                background: #f9fafb;
                display: block;
                object-fit: contain;
            `;

      if (canvas.parentNode) {
        canvas.parentNode.replaceChild(img, canvas);
        resolve();
      } else {
        console.warn("Canvas parent node not found, appending to container");
        resolve(); // Don't reject, continue processing
      }
    };

    img.onerror = (error) => {
      console.error("Error loading signature image:", error);
      resolve(); // Don't reject, continue processing
    };

    img.src = dataURL;
  });
};

const replaceCanvasWithEmptyImageOptimized = async (
  canvas: Element
): Promise<void> => {
  const div = document.createElement("div");
  div.style.cssText = `
        width: 100%;
        height: 128px;
        border: 1px solid #cccccc;
        background: #f9fafb;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9ca3af;
        font-size: 14px;
        font-family: Arial, sans-serif;
    `;
  div.textContent = "(Chưa ký)";

  if (canvas.parentNode) {
    canvas.parentNode.replaceChild(div, canvas);
  }
};

export const clearSignature = (
  sigRef: React.RefObject<SignatureCanvas>
): void => {
  sigRef.current?.clear();
};
