import type { Seller } from "@/types/productType";

export interface Buyer {
  name?: string;
  phone?: string;
  addressLine?: string;
  profile?: {
    address?: {
      houseNumber?: string;
      ward?: string;
      district?: string;
      province?: string;
    };
  };
}
export interface ContractRenderData {
  product: {
    title: string;
    brand?: string;
    model?: string;
    year?: number;
    condition?: string;
    price?: number;
  };
  seller: Seller | null;
  buyer?: Buyer | null;
  currentUserId?: string;
  unitPrice?: number;
  deliveryDateOffsetDays?: number; // days from now
  signBase64?: string | null;
  sellerSignature?: string | null;
  buyerSignature?: string | null;
  extraTerms?: string[]; // các điều khoản bổ sung, mỗi phần tử là một dòng
}

function formatVND(amount?: number) {
  if (amount == null) return "0";
  return amount.toLocaleString("vi-VN");
}

function numberToVietnameseWords(n: number | undefined) {
  if (!n && n !== 0) return "không đồng";
  return `${n?.toLocaleString("vi-VN")} đồng`;
}

function mapCondition(condition?: string) {
  if (!condition) return "…";
  const map: Record<string, string> = {
    used: "cũ",
    refurbished: "tân trang",
    new: "mới",
  };
  return map[condition] || condition;
}

/**
 * Build an address string for either Seller or Buyer.
 * Accepts Seller with profile.address, or Buyer with profile.address / addressLine.
 */
function buildAddress(entity?: Seller | Buyer | null): string {
  if (!entity) return "…";
  // Seller: address
  if ((entity as Seller).address) {
    const addr = (entity as Seller).address!;
    const parts = [
      addr.houseNumber,
      addr.ward,
      addr.district,
      addr.province,
    ].filter(Boolean);
    return parts.join(", ") || "…";
  }
  // Buyer: addressLine
  if ((entity as Buyer).addressLine) {
    return (entity as Buyer).addressLine!;
  }
  // Buyer: profile.address
  if ((entity as Buyer).profile?.address) {
    const addr = (entity as Buyer).profile!.address!;
    const parts = [
      addr.houseNumber,
      addr.ward,
      addr.district,
      addr.province,
    ].filter(Boolean);
    return parts.join(", ") || "…";
  }
  return "…";
}

export function renderContractHtml(data: ContractRenderData) {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = String(now.getFullYear());

  const sellerObj: Seller | null = data.seller ?? null;
  const buyerObj: Buyer | null = data.buyer ?? null;

  // Bên A: luôn là người bán
  let benAName = "…",
    benAEmail = "…",
    benAAddress = "…",
    benAPhone = "…";
  if (sellerObj) {
    benAName = sellerObj.name || "…";
    benAEmail = sellerObj.email || "…";
    benAAddress = buildAddress(sellerObj);
    benAPhone = sellerObj.phone || "…";
  }

  // Bên B: giữ các field trống nếu không có thông tin buyer
  let benBName = "",
    benBAddress = "",
    benBPhone = "",
    benBEmail = "";
  if (buyerObj) {
    benBName = buyerObj.name || "";
    benBAddress = buildAddress(buyerObj);
    benBPhone = buyerObj.phone || "";
    benBEmail = ""; // Add logic to populate email if available
  } else {
    // Explicitly clear buyer fields to ensure no unintended data is used
    benBName = "";
    benBAddress = "";
    benBPhone = "";
    benBEmail = "";
  }

  // Ensure buyer fields are not accidentally populated with seller data
  if (!data.buyer) {
    benBName = "";
    benBAddress = "";
    benBPhone = "";
    benBEmail = "";
  }

  const brand = data.product.brand || "…";
  const model = data.product.model || "…";
  const year = data.product.year || "…";
  const condition = mapCondition(data.product.condition);
  const productTitle = data.product.title || "…";

  const unitPrice = data.unitPrice ?? data.product.price ?? 0;
  const currency = formatVND(unitPrice);
  const currencyText = numberToVietnameseWords(unitPrice);

  const offset = data.deliveryDateOffsetDays ?? 3;
  const deliveryDate = new Date(
    now.getTime() + offset * 24 * 60 * 60 * 1000
  ).toLocaleDateString("vi-VN");

  // Signature pad embedded directly in template for both seller and buyer
  const sellerSignPad = `
    <div id="seller-signature-pad" class="signature-pad-embed">
      <canvas id="seller-signature-canvas" width="220" height="80" style="background:#fff;display:block;border-radius:8px;"></canvas>
      <button type="button" id="clear-seller-signature" style="margin-top:6px;padding:2px 10px;border-radius:4px;border:1px solid #bbb;background:#f3f7fb;cursor:pointer;font-size:13px;">Xóa ký tên</button>
      <div class="signer-name" style="margin-top: 16px; font-weight: bold; font-size: 16px; color: #222;">${benAName}</div>
    </div>
  `;
  const buyerSignPad = `
    <div id="buyer-signature-pad" class="signature-pad-embed">
      <canvas id="buyer-signature-canvas" width="220" height="80" style="background:#fff;display:block;border-radius:8px;"></canvas>
      <button type="button" id="clear-buyer-signature" style="margin-top:6px;padding:2px 10px;border-radius:4px;border:1px solid #bbb;background:#f3f7fb;cursor:pointer;font-size:13px;">Xóa ký tên</button>
      <div class="signer-name" style="margin-top: 16px; font-weight: bold; font-size: 16px; color: #222;">${benBName}</div>
    </div>
  `;

  // Extra terms
  let extraTermsHtml = `<div class="section"><div class="title">ĐIỀU KHOẢN BỔ SUNG</div><ul id="extra-terms-list">`;
  if (Array.isArray(data.extraTerms) && data.extraTerms.length > 0) {
    extraTermsHtml += data.extraTerms
      .map(
        (term) =>
          `<li contenteditable="true" class="extra-term-item">${term}</li>`
      )
      .join("");
  }
  extraTermsHtml += `<li style="list-style:none; margin-top:8px;"><button type="button" id="add-extra-term-btn" style="padding:4px 12px; border-radius:6px; border:1px solid #3b82f6; background:#e0f2fe; color:#2563eb; cursor:pointer; font-size:14px;">+ Thêm điều khoản</button></li>`;
  extraTermsHtml += `</ul></div>`;

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hợp đồng mua bán</title>
  <style>
    :root { --paper-width: 794px; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f3f7fb; color: #111827; }
    .paper { width: var(--paper-width); max-width: 100vw; margin: 0 auto; background: #fff; padding: 32px 40px; box-shadow: 0 2px 16px 0 rgba(0,0,0,0.08); border-radius: 12px; }
    h1, h2, h3 { margin: 0 0 8px; }
    h1 { text-align: center; font-size: 18px; }
    .center { text-align: center; }
    .subtitle { text-align: center; margin-top: 4px; font-weight: 600; }
    .divider { border-top: 1px solid #e5e7eb; margin: 10px 0 16px; }
    .row { margin: 8px 0; }
    .section { margin-top: 18px; }
    .title { font-weight: 700; font-size: 14px; margin-bottom: 8px; }
    ul { margin: 0; padding-left: 18px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 28px; align-items: start; }
    .signBox { text-align: center; padding-top: 8px; min-height: 160px; }
    .muted { color: rgba(0,0,0,0.6); }
    .signed { font-weight: 700; }
    .unsigned { font-weight: 700; }
    .small { font-size: 12px; }
    .signature-img { display: block; margin: 8px auto; max-height: 120px; max-width: 240px; object-fit: contain; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
    .signature-pad-embed { width: 220px; height: auto; margin: 12px auto; border: 1.5px dashed #bdbdbd; border-radius: 8px; background: #fafafa; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #bdbdbd; font-size: 14px; cursor: pointer; position: relative; padding: 8px; }
    .signature-pad-embed:before { content: 'Ký tại đây'; position: absolute; left: 0; right: 0; top: 6px; text-align: center; pointer-events: none; color: #9ca3af; font-size: 12px; }
    .signature-pad-embed.has-signature:before { content: ''; }
    .extra-terms { white-space: pre-wrap; margin-top: 6px; }
    [contenteditable] { outline: 1.5px solid #e0e7ef; border-radius: 4px; padding: 2px 4px; min-width: 40px; transition: outline-color 0.2s; }
    [contenteditable]:focus { outline-color: #3b82f6; background: #f0f6ff; }
    @media (max-width: 900px) {
      .paper { padding: 16px 4vw; }
      .grid { gap: 16px; }
    }
  </style>
</head>
<body>
  <div class="paper">
    <div class="center" style="margin-bottom: 12px;">
      <div style="font-weight:700">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
      <div>Độc lập – Tự do – Hạnh phúc</div>
    </div>
    <div class="divider"></div>
    <div class="center" style="margin: 10px 0 18px;">
      <div style="font-weight:700; font-size: 18px;">HỢP ĐỒNG MUA BÁN XE ĐIỆN / PIN XE ĐIỆN</div>
    </div>

    <div class="row small muted">Hôm nay, ngày <span contenteditable="true">${dd}</span> tháng <span contenteditable="true">${mm}</span> năm <span contenteditable="true">${yyyy}</span>, chúng tôi gồm:</div>

    <div class="section">
      <div class="title">BÊN BÁN (Bên A):</div>
      <ul>
        <li>Họ và tên/Tên doanh nghiệp: <span contenteditable="true">${benAName}</span> <span class="signed">(đã ký)</span></li>
        <li>Email: <span contenteditable="true">${benAEmail}</span></li>
        <li>CMND/CCCD/MST: <span contenteditable="true">…………………………………</span></li>
        <li>Địa chỉ: <span contenteditable="true">${benAAddress}</span></li>
        <li>Điện thoại: <span contenteditable="true">${benAPhone}</span></li>
      </ul>
    </div>

    <div class="divider"></div>

    <div class="section">
      <div class="title">BÊN MUA (Bên B):</div>
      <ul>
        <li>Họ và tên: <span contenteditable="true">${benBName}</span></li>
        <li>Địa chỉ: <span contenteditable="true">${benBAddress}</span></li>
        <li>Điện thoại: <span contenteditable="true">${benBPhone}</span></li>
        <li>Email: <span contenteditable="true">${benBEmail}</span></li>
      </ul>
    </div>

    <div class="divider"></div>

    <div class="section">
      <div class="title">ĐIỀU 1. ĐỐI TƯỢNG HỢP ĐỒNG</div>
      <ul>
        <li>Loại: <span contenteditable="true">Xe điện</span></li>
        <li>Nhãn hiệu: <span contenteditable="true">${brand || "…"}</span></li>
        <li>Model/Đời: <span contenteditable="true">${model || "…"}</span></li>
        <li>Năm sản xuất: <span contenteditable="true">${
          year || "…"
        }</span></li>
        <li>Tình trạng: <span contenteditable="true">${
          condition || "…"
        }</span></li>
        <li>Sản phẩm: <span contenteditable="true">${productTitle}</span></li>
        <li>Giá trị còn lại của pin (nếu có): <span contenteditable="true">…………………………………</span></li>
      </ul>
    </div>

    <div class="section">
      <div class="title">ĐIỀU 2. GIÁ BÁN VÀ PHƯƠNG THỨC THANH TOÁN</div>
      <ul>
        <li>Giá bán: <span contenteditable="true">${currency}</span> VNĐ (Bằng chữ: <strong contenteditable="true">${currencyText}</strong>)</li>
        <li>Giá trên đã bao gồm chi phí vận chuyển, thuế, phí khác.</li>
        <li>Phương thức thanh toán: <span contenteditable="true">Ví điện tử Ecoin</span></li>
        <li>Thời hạn thanh toán: <span contenteditable="true">Ngay khi ký hợp đồng</span></li>
      </ul>
    </div>

    <div class="section">
      <div class="title">ĐIỀU 3. GIAO NHẬN</div>
      <ul>
        <li>Địa điểm giao hàng: <span contenteditable="true">${benBAddress}</span></li>
        <li>Thời gian giao hàng: <span contenteditable="true">khoảng ${deliveryDate}</span></li>
        <li>Bên A cam kết bàn giao đầy đủ giấy tờ liên quan.</li>
      </ul>
    </div>

    <div class="section">
      <div class="title">ĐIỀU 4. QUYỀN VÀ NGHĨA VỤ CỦA BÊN A</div>
      <ul>
        <li>Cung cấp sản phẩm đúng thông tin đã cam kết.</li>
        <li>Chịu trách nhiệm về nguồn gốc hợp pháp của sản phẩm.</li>
        <li>Bảo hành (nếu có): <span contenteditable="true">…………………………………</span></li>
      </ul>
    </div>

    <div class="section">
      <div class="title">ĐIỀU 5. QUYỀN VÀ NGHĨA VỤ CỦA BÊN B</div>
      <ul>
        <li>Thanh toán đúng thời hạn, đúng số tiền đã thỏa thuận.</li>
        <li>Nhận sản phẩm theo đúng thời gian, địa điểm.</li>
      </ul>
    </div>

    <div class="section">
      <div class="title">ĐIỀU 6. GIẢI QUYẾT TRANH CHẤP</div>
      <ul>
        <li>Hai bên ưu tiên giải quyết bằng thương lượng, hòa giải.</li>
        <li>Nếu không đạt thỏa thuận, đưa ra Tòa án có thẩm quyền.</li>
      </ul>
    </div>

    <div class="section">
      <div class="title">ĐIỀU 7. ĐIỀU KHOẢN CHUNG</div>
      <ul>
        <li>Hợp đồng này có hiệu lực kể từ ngày ký.</li>
        <li>Hợp đồng được lập thành 02 bản, mỗi bên giữ 01 bản.</li>
      </ul>
    </div>
    ${extraTermsHtml}

    <div class="grid">
      <div class="signBox">
        <div><strong>ĐẠI DIỆN BÊN A (Bán)</strong></div>
        <div class="small muted">Ký, ghi rõ họ tên</div>
        ${sellerSignPad}
        <div class="signed"></div>
      </div>
      <div class="signBox">
        <div><strong>ĐẠI DIỆN BÊN B (Mua)</strong></div>
        <div class="small muted">Ký, ghi rõ họ tên</div>
        ${buyerSignPad}
        <div class="unsigned"></div>
      </div>
    </div>
  </div>

  <script>
    // minimal helper để cho parent có thể lấy chữ ký canvas
    (function(){
      // Bạn có thể khởi tạo SignaturePad trong parent như trước, hoặc
      // khởi tạo bên trong iframe nếu muốn tự quản lý.
      // Đây chỉ là placeholder để parent biết có các id canvas.
      window.__contractTemplateReady = true;
    })();
  </script>
</body>
</html>`;

  return html;
}

export default renderContractHtml;
