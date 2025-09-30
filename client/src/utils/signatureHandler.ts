import SignatureCanvas from "react-signature-canvas";

export interface SignatureRefs {
    buyer: React.RefObject<SignatureCanvas>;
    seller: React.RefObject<SignatureCanvas>;
}

export const replaceSignatureCanvasWithImages = async (
    clonedElement: HTMLElement,
    signatures: SignatureRefs
): Promise<void> => {
    const buyerSig = getSignatureDataURL(signatures.buyer);
    const sellerSig = getSignatureDataURL(signatures.seller);

    // Debug log
    console.log('Buyer signature exists:', !!buyerSig);
    console.log('Seller signature exists:', !!sellerSig);

    // Thay canvas buyer
    const buyerCanvas = clonedElement.querySelector('[data-signature="buyer"]');
    if (buyerCanvas) {
        console.log('Found buyer canvas element');
        if (buyerSig) {
            await replaceCanvasWithImage(buyerCanvas, buyerSig);
            console.log('Replaced buyer canvas with image');
        } else {
            // Tạo ảnh trống nếu không có chữ ký
            await replaceCanvasWithEmptyImage(buyerCanvas);
        }
    } else {
        console.error('Buyer canvas not found');
    }

    // Thay canvas seller
    const sellerCanvas = clonedElement.querySelector('[data-signature="seller"]');
    if (sellerCanvas) {
        console.log('Found seller canvas element');
        if (sellerSig) {
            await replaceCanvasWithImage(sellerCanvas, sellerSig);
            console.log('Replaced seller canvas with image');
        } else {
            // Tạo ảnh trống nếu không có chữ ký
            await replaceCanvasWithEmptyImage(sellerCanvas);
        }
    } else {
        console.error('Seller canvas not found');
    }
};

const getSignatureDataURL = (sigRef: React.RefObject<SignatureCanvas>): string | null => {
    if (!sigRef.current) {
        console.log('Signature ref is null');
        return null;
    }
    
    if (sigRef.current.isEmpty()) {
        console.log('Signature is empty');
        return null;
    }
    
    try {
        const dataURL = sigRef.current.getCanvas().toDataURL("image/png");
        console.log('Generated signature dataURL:', dataURL.substring(0, 50) + '...');
        return dataURL;
    } catch (error) {
        console.error('Error getting signature dataURL:', error);
        return null;
    }
};

const replaceCanvasWithImage = async (canvas: Element, dataURL: string): Promise<void> => {
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
                console.log('Successfully replaced canvas with image');
                resolve();
            } else {
                reject(new Error('Canvas parent node not found'));
            }
        };
        
        img.onerror = (error) => {
            console.error('Error loading signature image:', error);
            reject(error);
        };
        
        img.src = dataURL;
    });
};

const replaceCanvasWithEmptyImage = async (canvas: Element): Promise<void> => {
    const div = document.createElement('div');
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
    div.textContent = '(Chưa ký)';
    
    if (canvas.parentNode) {
        canvas.parentNode.replaceChild(div, canvas);
    }
};

export const clearSignature = (sigRef: React.RefObject<SignatureCanvas>): void => {
    sigRef.current?.clear();
};