import SignatureCanvas from "react-signature-canvas";

export interface SignatureRefs {
  signer: React.RefObject<SignatureCanvas>;
}

export const replaceSignatureCanvasWithImages = async (
  clonedElement: HTMLElement,
  signatures: SignatureRefs
): Promise<void> => {
  const signerSig = getSignatureDataURL(signatures.signer);

  // Debug log
  console.log("Signer signature exists:", !!signerSig);

  // Tìm canvas chữ ký
  const signerCanvas = clonedElement.querySelector('[data-signature="signer"]');
  if (signerCanvas) {
    console.log("Found signer canvas element");
    if (signerSig) {
      await replaceCanvasWithImage(signerCanvas, signerSig);
      console.log("Replaced signer canvas with image");
    } else {
      // Nếu không có chữ ký thì thay bằng placeholder
      await replaceCanvasWithEmptyImage(signerCanvas);
    }
  } else {
    console.error("Signer canvas not found");
  }
};

const getSignatureDataURL = (
  sigRef: React.RefObject<SignatureCanvas>
): string | null => {
  if (!sigRef.current) {
    console.log("Signature ref is null");
    return null;
  }

  if (sigRef.current.isEmpty()) {
    console.log("Signature is empty");
    return null;
  }

  try {
    const dataURL = sigRef.current.getCanvas().toDataURL("image/png");
    console.log(
      "Generated signature dataURL:",
      dataURL.substring(0, 50) + "..."
    );
    return dataURL;
  } catch (error) {
    console.error("Error getting signature dataURL:", error);
    return null;
  }
};

const replaceCanvasWithImage = async (
  canvas: Element,
  dataURL: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
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
        console.log("Successfully replaced canvas with image");
        resolve();
      } else {
        reject(new Error("Canvas parent node not found"));
      }
    };

    img.onerror = (error) => {
      console.error("Error loading signature image:", error);
      reject(error);
    };

    img.src = dataURL;
  });
};

const replaceCanvasWithEmptyImage = async (canvas: Element): Promise<void> => {
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
