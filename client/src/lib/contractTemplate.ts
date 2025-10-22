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
  seller: Seller;
  buyer?: Buyer;
  unitPrice?: number;
  deliveryDateOffsetDays?: number; // days from now
  // legacy name or alternate: signBase64
  signBase64?: string | null;
  sellerSignature?: string | null;
  buyerSignature?: string | null;
}

function formatVND(amount?: number) {
  if (amount == null) return "0";
  return amount.toLocaleString("vi-VN");
}

function numberToVietnameseWords(n: number | undefined) {
  if (!n && n !== 0) return "không đồng";
  // simple fallback: return number + ' đồng' when no library is available
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

function buildAddressFromSeller(seller?: Seller | null) {
  if (!seller) return "…";
  type AddressLike = {
    houseNumber?: string;
    ward?: string;
    district?: string;
    province?: string;
  };
  const s = seller as unknown as {
    profile?: { address?: AddressLike };
    address?: AddressLike;
  };
  const addr = s.profile?.address || s.address;
  if (!addr) return "…";
  const parts = [
    addr.houseNumber,
    addr.ward,
    addr.district,
    addr.province,
  ].filter(Boolean);
  return parts.join(", ");
}

export function renderContractHtml(data: ContractRenderData) {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = String(now.getFullYear());

  const sellerObj: Seller | undefined | null = data.seller;
  const sellerName = sellerObj?.name || "…";
  const sellerAddress = buildAddressFromSeller(sellerObj);
  const sellerPhone = sellerObj?.phone || "…";
  // sellerEmail and createdAt intentionally omitted from template

  const buyerName = data.buyer?.name || "…";
  const receiverPhone = data.buyer?.phone || "…";
  const deliveryPlace =
    data.buyer?.addressLine ||
    (data.buyer?.profile?.address
      ? [
          data.buyer.profile.address.houseNumber,
          data.buyer.profile.address.ward,
          data.buyer.profile.address.district,
          data.buyer.profile.address.province,
        ]
          .filter(Boolean)
          .join(", ")
      : "…");

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

  const effectiveBuyerSignature =
    data.buyerSignature || data.signBase64 || null;
  const signImg = effectiveBuyerSignature
    ? `<div style="margin:12px 0"><img src="${effectiveBuyerSignature}" alt="signature" style="max-width:220px; max-height:120px;" /></div>`
    : `<div style="height:80px"></div>`;

  const sellerSignBlock = data.sellerSignature
    ? `<div style="margin-top:24px"><img src="${data.sellerSignature}" alt="seller-sign" style="max-height:80px;" /></div>`
    : `<div style="margin-top:33px; font-weight: 800;">Đã ký</div>`;

  // Template HTML (user-provided). Insert interpolated values.
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hợp đồng mua bán</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; padding: 28px; color: #111827; line-height: 1.65; }
    h1, h2, h3 { margin: 0 0 8px; }
    h1 { text-align: center; font-size: 18px; }
    .center { text-align: center; }
    .subtitle { text-align: center; margin-top: 4px; font-weight: 600; }
    .divider { border-top: 1px solid #e5e7eb; margin: 10px 0 16px; }
    .row { margin: 6px 0; }
    .section { margin-top: 14px; }
    .title { font-weight: 700; font-size: 15px; margin-bottom: 6px; }
    ul { margin: 0; padding-left: 18px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 20px; }
    .signBox { text-align: center; padding-top: 24px; }
    .muted { }
    .signed { font-weight: 700; }
    .unsigned { font-weight: 700; }
    .small { font-size: 12px; }
  </style>
</head>
<body>
  <div class="center" style="margin-bottom: 12px;">
    <div style="font-weight:700">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
    <div>Độc lập – Tự do – Hạnh phúc</div>
  </div>
  <div class="divider"></div>
  <div class="center" style="margin: 10px 0 18px;">
    <div style="font-weight:700; font-size: 18px;">HỢP ĐỒNG MUA BÁN XE ĐIỆN / PIN XE ĐIỆN</div>
  </div>

  <div class="row small muted">Hôm nay, ngày ${dd} tháng ${mm} năm ${yyyy}, chúng tôi gồm:</div>

  <div class="section">
    <div class="title">BÊN BÁN (Bên A):</div>
    <ul>
      <li>Họ và tên/Tên doanh nghiệp: ${sellerName} <span class="signed">(đã ký)</span></li>
      <li>CMND/CCCD/MST: …………………………………</li>
      <li>Địa chỉ: ${sellerAddress || '…'}</li>
      <li>Điện thoại: ${sellerPhone || '…'}</li>
    </ul>
  </div>

  <div class="section">
    <div class="title">BÊN MUA (Bên B):</div>
    <ul>
      <li>Họ và tên/Tên doanh nghiệp: ${buyerName} <span class="unsigned"></span></li>
      <li>CMND/CCCD/MST: …………………………………</li>
      <li>Địa chỉ: ${deliveryPlace || '…'}</li>
      <li>Điện thoại: ${receiverPhone || '…'}</li>
    </ul>
  </div>

  <div class="divider"></div>

  <div class="section">
    <div class="title">ĐIỀU 1. ĐỐI TƯỢNG HỢP ĐỒNG</div>
    <ul>
      <li>Loại: Xe điện</li>
      <li>Nhãn hiệu: ${brand || '…'}</li>
      <li>Model/Đời: ${model || '…'}</li>
      <li>Năm sản xuất: ${year || '…'}</li>
      <li>Tình trạng: ${condition || '…'}</li>
      <li>Sản phẩm: ${productTitle}</li>
      <li>Giá trị còn lại của pin (nếu có): …………………………………</li>
    </ul>
  </div>

  <div class="section">
    <div class="title">ĐIỀU 2. GIÁ BÁN VÀ PHƯƠNG THỨC THANH TOÁN</div>
    <ul>
      <li>Giá bán: ${currency} VNĐ (Bằng chữ: <strong>${currencyText}</strong>)</li>
      <li>Giá trên không bao gồm chi phí vận chuyển, thuế, phí khác.</li>
      <li>Phương thức thanh toán: Ví điện tử Ecoin</li>
      <li>Thời hạn thanh toán: Ngay khi ký hợp đồng</li>
    </ul>
  </div>

  <div class="section">
    <div class="title">ĐIỀU 3. GIAO NHẬN</div>
    <ul>
      <li>Địa điểm giao hàng: ${deliveryPlace || '…'}</li>
      <li>Thời gian giao hàng: khoảng ${deliveryDate}</li>
      <li>Bên A cam kết bàn giao đầy đủ giấy tờ liên quan.</li>
    </ul>
  </div>

  <div class="section">
    <div class="title">ĐIỀU 4. QUYỀN VÀ NGHĨA VỤ CỦA BÊN A</div>
    <ul>
      <li>Cung cấp sản phẩm đúng thông tin đã cam kết.</li>
      <li>Chịu trách nhiệm về nguồn gốc hợp pháp của sản phẩm.</li>
      <li>Bảo hành (nếu có): …………………………………</li>
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

  <div class="grid">
    <div class="signBox">
      <div><strong>ĐẠI DIỆN BÊN A (Bán)</strong></div>
      <div class="small muted">Ký, ghi rõ họ tên</div>
      ${sellerSignBlock}
      <div style="margin-top: 24px;"></div>
      <div>${sellerName}</div>
      <div class="signed"></div>
    </div>
    <div class="signBox">
      <div><strong>ĐẠI DIỆN BÊN B (Mua)</strong></div>
      <div class="small muted">Ký, ghi rõ họ tên</div>
      ${signImg}
      <div>${buyerName}</div>
      <div class="unsigned"></div>
    </div>
  </div>
</body>
</html>`;

  return html;
}

export default renderContractHtml;
