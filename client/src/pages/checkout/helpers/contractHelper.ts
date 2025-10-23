/**
 * Update contract HTML with signatures, pricing, and user data
 */
export function updateContractHtml(
    baseHtml: string,
    data: {
        sellerSignature?: string | null;
        buyerSignature?: string | null;
        buyerName?: string | null;
        totalPrice: number;
        shippingFee: number;
        seller: {
            name: string;
            email: string;
            phone: string;
            address: {
                houseNumber: string;
                ward: string;
                district: string;
                province: string;
            };
        };
        buyer: {
            name: string;
            email: string;
            phone: string;
            address: {
                houseNumber: string;
                ward: string;
                district: string;
                province: string;
            };
        };
    }
): string {
    let html = baseHtml;

    console.log('🔧 Contract Helper Debug:', {
        hasSellerSignature: !!data.sellerSignature,
        hasBuyerSignature: !!data.buyerSignature,
        htmlLength: html.length,
        hasSellerCanvas: html.includes('seller-signature-canvas'),
        hasBuyerCanvas: html.includes('buyer-signature-canvas'),
    });

    // Replace seller signature - try multiple patterns
    if (data.sellerSignature) {
        const sellerImg = `<img src="${data.sellerSignature}" alt="Seller Signature" style="width: 220px; height: 80px; border-radius: 8px;" />`;
        
        // Pattern 1: canvas với id="seller-signature-canvas"
        html = html.replace(
            /<canvas[^>]*id="seller-signature-canvas"[^>]*>[\s\S]*?<\/canvas>/i,
            sellerImg
        );
        
        // Pattern 2: canvas với id='seller-signature-canvas'
        html = html.replace(
            /<canvas[^>]*id='seller-signature-canvas'[^>]*>[\s\S]*?<\/canvas>/i,
            sellerImg
        );
        
        // Pattern 3: self-closing canvas
        html = html.replace(
            /<canvas[^>]*id=["']?seller-signature-canvas["']?[^>]*\/>/i,
            sellerImg
        );
    }

    // Replace buyer signature - try multiple patterns
    if (data.buyerSignature) {
        const buyerImg = `<img src="${data.buyerSignature}" alt="Buyer Signature" style="width: 220px; height: 80px; border-radius: 8px;" /><div style="margin-top: 10px; font-weight: bold;">${data.buyerName || ""}</div>`;
        
        // Pattern 1: canvas với id="buyer-signature-canvas"
        html = html.replace(
            /<canvas[^>]*id="buyer-signature-canvas"[^>]*>[\s\S]*?<\/canvas>/i,
            buyerImg
        );
        
        // Pattern 2: canvas với id='buyer-signature-canvas'
        html = html.replace(
            /<canvas[^>]*id='buyer-signature-canvas'[^>]*>[\s\S]*?<\/canvas>/i,
            buyerImg
        );
        
        // Pattern 3: self-closing canvas
        html = html.replace(
            /<canvas[^>]*id=["']?buyer-signature-canvas["']?[^>]*\/>/i,
            buyerImg
        );
    }

    // Update total price
    html = html.replace(
        /Giá bán: <span[^>]*>.*?<\/span> VNĐ \(Bằng chữ: <strong[^>]*>.*?<\/strong>\)/,
        `Giá bán: <span>${data.totalPrice.toLocaleString("vi-VN")}</span> VNĐ (Bằng chữ: <strong>${data.totalPrice.toLocaleString("vi-VN")} đồng</strong>)`
    );

    // Update shipping fee
    if (!/Phí vận chuyển:/.test(html)) {
        html = html.replace(
            /(<div class="section">\s*<div class="title">ĐIỀU 2\. GIÁ BÁN VÀ PHƯƠNG THỨC THANH TOÁN<\/div>\s*<ul>)/,
            `$1\n<li>Phí vận chuyển: <span>${data.shippingFee.toLocaleString("vi-VN")}</span> VNĐ</li>`
        );
    } else {
        html = html.replace(
            /Phí vận chuyển: <span[^>]*>.*?<\/span> VNĐ/,
            `Phí vận chuyển: <span>${data.shippingFee.toLocaleString("vi-VN")}</span> VNĐ`
        );
    }

    // Replace seller placeholders
    html = html.replace(/\$\{benAName\}/g, data.seller.name || "…");
    html = html.replace(/\$\{benAEmail\}/g, data.seller.email || "…");
    html = html.replace(/\$\{benAPhone\}/g, data.seller.phone || "…");
    html = html.replace(
        /\$\{benAAddress\}/g,
        `${data.seller.address.houseNumber}, ${data.seller.address.ward}, ${data.seller.address.district}, ${data.seller.address.province}`
    );

    // Replace buyer placeholders
    html = html.replace(/\$\{benBName\}/g, data.buyer.name || "…");
    html = html.replace(/\$\{benBEmail\}/g, data.buyer.email || "…");
    html = html.replace(/\$\{benBPhone\}/g, data.buyer.phone || "…");
    html = html.replace(
        /\$\{benBAddress\}/g,
        `${data.buyer.address.houseNumber}, ${data.buyer.address.ward}, ${data.buyer.address.district}, ${data.buyer.address.province}`
    );

    // Inject buyer info into static fields
    html = html.replace(/<li>Họ và tên: <span><\/span><\/li>/, `<li>Họ và tên: <span>${data.buyer.name}</span></li>`);
    html = html.replace(/<li>Địa chỉ: <span><\/span><\/li>/, `<li>Địa chỉ: <span>${data.buyer.address.houseNumber}, ${data.buyer.address.ward}, ${data.buyer.address.district}, ${data.buyer.address.province}</span></li>`);
    html = html.replace(/<li>Điện thoại: <span><\/span><\/li>/, `<li>Điện thoại: <span>${data.buyer.phone}</span></li>`);
    html = html.replace(/<li>Email: <span><\/span><\/li>/, `<li>Email: <span>${data.buyer.email}</span></li>`);

    return html;
}
