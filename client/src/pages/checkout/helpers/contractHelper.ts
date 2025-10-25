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
  },
  isSigningStep: boolean = false
): string {
  let html = baseHtml;

  // === Seller signature ===
  if (isSigningStep) {
    // Hiển thị canvas để ký
    const sellerPad = `
      <div class="signature-wrapper">
        <canvas id="seller-signature-canvas" width="400" height="150" style="border: 1px solid #ccc; border-radius: 8px;"></canvas>
        <div style="font-weight: bold; margin-top: 5px;">(Ký tên bên bán)</div>
      </div>
    `;
    html = html.replace(
      /<img[^>]*id=["']?seller-signature-canvas["']?[^>]*>/i,
      sellerPad
    );
    html = html.replace(
      /<canvas[^>]*id=["']?seller-signature-canvas["']?[^>]*>[\s\S]*?<\/canvas>/i,
      sellerPad
    );
  } else if (data.sellerSignature) {
    // Sau khi ký xong hiển thị hình ảnh chữ ký
    const sellerImg = `<img src="${data.sellerSignature}" alt="Seller Signature" id="seller-signature-canvas" style="width: 220px; height: 80px; border-radius: 8px;" />`;
    html = html.replace(
      /<canvas[^>]*id=["']?seller-signature-canvas["']?[^>]*>[\s\S]*?<\/canvas>/i,
      sellerImg
    );
  }

  // === Buyer signature ===
  if (isSigningStep) {
    const buyerPad = `
      <div class="signature-wrapper">
        <canvas id="buyer-signature-canvas" width="400" height="150" style="border: 1px solid #ccc; border-radius: 8px;"></canvas>
        <div style="font-weight: bold; margin-top: 5px;">(Ký tên bên mua)</div>
      </div>
    `;
    html = html.replace(
      /<img[^>]*id=["']?buyer-signature-canvas["']?[^>]*>/i,
      buyerPad
    );
    html = html.replace(
      /<canvas[^>]*id=["']?buyer-signature-canvas["']?[^>]*>[\s\S]*?<\/canvas>/i,
      buyerPad
    );
  } else if (data.buyerSignature) {
    const buyerImg = `<img src="${
      data.buyerSignature
    }" alt="Buyer Signature" id="buyer-signature-canvas" style="width: 220px; height: 80px; border-radius: 8px;" /><div style="margin-top: 10px; font-weight: bold;">${
      data.buyerName || ""
    }</div>`;
    html = html.replace(
      /<canvas[^>]*id=["']?buyer-signature-canvas["']?[^>]*>[\s\S]*?<\/canvas>/i,
      buyerImg
    );
  }

  // === Update shipping fee ===
  if (!/Phí vận chuyển:/.test(html)) {
    html = html.replace(
      /(<div class="section">\s*<div class="title">ĐIỀU 2\. GIÁ BÁN VÀ PHƯƠNG THỨC THANH TOÁN<\/div>\s*<ul>)/,
      `$1\n<li>Phí vận chuyển: <span>${data.shippingFee.toLocaleString(
        "vi-VN"
      )}</span> VNĐ</li>`
    );
  } else {
    html = html.replace(
      /Phí vận chuyển: <span[^>]*>.*?<\/span> VNĐ/,
      `Phí vận chuyển: <span>${data.shippingFee.toLocaleString(
        "vi-VN"
      )}</span> VNĐ`
    );
  }

  // === Replace seller placeholders ===
  html = html.replace(/\$\{benAName\}/g, data.seller.name || "…");
  html = html.replace(/\$\{benAEmail\}/g, data.seller.email || "…");
  html = html.replace(/\$\{benAPhone\}/g, data.seller.phone || "…");
  html = html.replace(
    /\$\{benAAddress\}/g,
    `${data.seller.address.houseNumber}, ${data.seller.address.ward}, ${data.seller.address.district}, ${data.seller.address.province}`
  );

  // === Replace buyer placeholders ===
  html = html.replace(/\$\{benBName\}/g, data.buyer.name || "…");
  html = html.replace(/\$\{benBEmail\}/g, data.buyer.email || "…");
  html = html.replace(/\$\{benBPhone\}/g, data.buyer.phone || "…");
  html = html.replace(
    /\$\{benBAddress\}/g,
    `${data.buyer.address.houseNumber}, ${data.buyer.address.ward}, ${data.buyer.address.district}, ${data.buyer.address.province}`
  );

  // === Inject buyer info into static fields ===
  html = html.replace(
    /<li>Họ và tên: <span><\/span><\/li>/,
    `<li>Họ và tên: <span>${data.buyer.name}</span></li>`
  );
  html = html.replace(
    /<li>Địa chỉ: <span><\/span><\/li>/,
    `<li>Địa chỉ: <span>${data.buyer.address.houseNumber}, ${data.buyer.address.ward}, ${data.buyer.address.district}, ${data.buyer.address.province}</span></li>`
  );
  html = html.replace(
    /<li>Điện thoại: <span><\/span><\/li>/,
    `<li>Điện thoại: <span>${data.buyer.phone}</span></li>`
  );
  html = html.replace(
    /<li>Email: <span><\/span><\/li>/,
    `<li>Email: <span>${data.buyer.email}</span></li>`
  );

  return html;
}
