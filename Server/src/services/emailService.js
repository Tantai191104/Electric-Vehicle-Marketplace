import { transporter } from '../config/email.js';

async function sendViaSendGrid(to, subject, html) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.EMAIL_USER;
  if (!apiKey || !from) {
    throw new Error(
      'SendGrid not configured: missing SENDGRID_API_KEY or EMAIL_USER'
    );
  }
  const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`SendGrid error ${resp.status}: ${text}`);
  }
  return true;
}

/**
 * Send order confirmation email to buyer
 * @param {Object} params - Email parameters
 * @param {string} params.buyerEmail - Buyer's email address
 * @param {string} params.buyerName - Buyer's name
 * @param {string} params.productTitle - Product title
 * @param {string} params.productImage - Product image URL
 * @param {number} params.unitPrice - Product unit price
 * @param {number} params.shippingFee - Shipping fee
 * @param {number} params.totalAmount - Total amount
 * @param {string} params.orderCode - GHN order code
 */
export async function sendBuyerOrderConfirmation({
  buyerEmail,
  buyerName,
  productTitle,
  productImage,
  unitPrice,
  shippingFee,
  totalAmount,
  orderCode,
}) {
  const formattedUnitPrice = new Intl.NumberFormat('vi-VN').format(unitPrice);
  const formattedShippingFee = new Intl.NumberFormat('vi-VN').format(
    shippingFee
  );
  const formattedTotal = new Intl.NumberFormat('vi-VN').format(totalAmount);

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đặt hàng thành công</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .product-info { background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .product-image { width: 100%; max-width: 300px; height: auto; border-radius: 8px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto; }
    .product-title { font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #333; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: 600; color: #666; }
    .info-value { color: #333; }
    .total-row { background: #FFD700; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 18px; font-weight: bold; display: flex; justify-content: space-between; }
    .order-code { background: #fff3cd; border-left: 4px solid #FFD700; padding: 15px; margin: 20px 0; }
    .order-code-label { font-weight: 600; color: #856404; }
    .order-code-value { font-size: 20px; font-weight: bold; color: #000; margin-top: 5px; }
    .shipping-info { background: #e7f3ff; border-radius: 8px; padding: 15px; margin: 20px 0; }
    .shipping-info h3 { margin-top: 0; color: #0066cc; }
    .payment-info { background: #fff3e0; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #FF9800; }
    .payment-info h3 { margin-top: 0; color: #E65100; }
    .footer { background: #f4f4f4; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    .success-icon { font-size: 48px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="success-icon">✅</div>
      <h1>Đặt hàng thành công!</h1>
    </div>
    <div class="content">
      <div class="greeting">Xin chào <strong>${buyerName}</strong>,</div>
      <p>Cảm ơn bạn đã đặt hàng! Đơn hàng của bạn đã được xác nhận và đang được xử lý.</p>
      
      <div class="product-info">
        <div class="product-title">${productTitle}</div>
        ${
          productImage
            ? `<img src="${productImage}" alt="${productTitle}" class="product-image" />`
            : ''
        }
        
        <div class="info-row">
          <span class="info-label">Giá sản phẩm:</span>
          <span class="info-value">${formattedUnitPrice} VNĐ</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phí vận chuyển:</span>
          <span class="info-value">${formattedShippingFee} VNĐ</span>
        </div>
      </div>

      <div class="total-row">
        <span>Tổng tiền hàng:</span>
        <span>${formattedUnitPrice} VNĐ</span>
      </div>

      <div class="payment-info">
        <h3>💰 Thông tin thanh toán</h3>
        <p><strong>Lưu ý:</strong> Phí vận chuyển sẽ được tính riêng và thanh toán khi nhận hàng.</p>
        <p><strong>Tổng tiền hàng:</strong> ${formattedUnitPrice} VNĐ (chưa bao gồm phí ship)</p>
        <p><strong>Phí vận chuyển:</strong> ${formattedShippingFee} VNĐ (thanh toán khi nhận hàng)</p>
      </div>

      <div class="order-code">
        <div class="order-code-label">Mã đơn hàng:</div>
        <div class="order-code-value">${orderCode}</div>
      </div>

      <div class="shipping-info">
        <h3>🚚 Thông tin vận chuyển</h3>
        <p><strong>Đơn vị vận chuyển:</strong> GHN (Giao Hàng Nhanh)</p>
        <p><strong>Mã vận đơn:</strong> ${orderCode}</p>
        <p>Bạn có thể theo dõi đơn hàng của mình trong mục <strong>Lịch sử đơn hàng</strong> trên ứng dụng.</p>
      </div>

      <p style="margin-top: 30px;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
      <p>Trân trọng,<br><strong>Đội ngũ EV Marketplace</strong></p>
    </div>
    <div class="footer">
      <p>Email này được gửi tự động, vui lòng không trả lời.</p>
      <p>&copy; ${new Date().getFullYear()} EV Marketplace. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

  const mailOptions = {
    from: `"EV Marketplace" <${process.env.EMAIL_USER}>`,
    to: buyerEmail,
    subject: `✅ Đặt hàng thành công - Mã đơn hàng ${orderCode}`,
    html: htmlContent,
  };

  try {
    // Prefer SendGrid HTTP if configured
    if (String(process.env.EMAIL_PROVIDER || '').toLowerCase() === 'sendgrid') {
      await sendViaSendGrid(
        buyerEmail,
        `✅ Đặt hàng thành công - Mã đơn hàng ${orderCode}`,
        htmlContent
      );
      console.log('✅ Buyer confirmation email sent via SendGrid');
      return { success: true };
    }
    // SMTP fallback (requires EMAIL_USER/PASSWORD and reachable SMTP)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn(
        '⚠️ Email not configured, skipping buyer confirmation email'
      );
      return { success: false, error: 'Email not configured' };
    }
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Buyer confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send buyer confirmation email:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send order notification email to seller
 * @param {Object} params - Email parameters
 * @param {string} params.sellerEmail - Seller's email address
 * @param {string} params.sellerName - Seller's name
 * @param {string} params.buyerName - Buyer's name
 * @param {string} params.buyerPhone - Buyer's phone
 * @param {string} params.buyerAddress - Buyer's full address
 * @param {string} params.productTitle - Product title
 * @param {string} params.productImage - Product image URL
 * @param {number} params.unitPrice - Product unit price
 * @param {number} params.shippingFee - Shipping fee
 * @param {number} params.totalAmount - Total amount
 * @param {string} params.orderCode - GHN order code
 */
export async function sendSellerOrderNotification({
  sellerEmail,
  sellerName,
  buyerName,
  buyerPhone,
  buyerAddress,
  productTitle,
  productImage,
  unitPrice,
  shippingFee,
  totalAmount,
  orderCode,
}) {
  const formattedUnitPrice = new Intl.NumberFormat('vi-VN').format(unitPrice);
  const formattedShippingFee = new Intl.NumberFormat('vi-VN').format(
    shippingFee
  );
  const formattedTotal = new Intl.NumberFormat('vi-VN').format(totalAmount);

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bán hàng thành công</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: #fff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .product-info { background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .product-image { width: 100%; max-width: 300px; height: auto; border-radius: 8px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto; }
    .product-title { font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #333; }
    .buyer-info { background: #fff3e0; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #FF9800; }
    .buyer-info h3 { margin-top: 0; color: #E65100; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: 600; color: #666; }
    .info-value { color: #333; }
    .total-row { background: #4CAF50; color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 18px; font-weight: bold; display: flex; justify-content: space-between; }
    .order-code { background: #e8f5e9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0; }
    .order-code-label { font-weight: 600; color: #2e7d32; }
    .order-code-value { font-size: 20px; font-weight: bold; color: #000; margin-top: 5px; }
    .shipping-info { background: #e7f3ff; border-radius: 8px; padding: 15px; margin: 20px 0; }
    .shipping-info h3 { margin-top: 0; color: #0066cc; }
    .payment-info { background: #fff3e0; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #FF9800; }
    .payment-info h3 { margin-top: 0; color: #E65100; }
    .footer { background: #f4f4f4; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    .success-icon { font-size: 48px; margin-bottom: 10px; }
    .buyer-detail { margin: 10px 0; padding: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="success-icon">🎉</div>
      <h1>Bán hàng thành công!</h1>
    </div>
    <div class="content">
      <div class="greeting">Xin chào <strong>${sellerName}</strong>,</div>
      <p>Chúc mừng! Sản phẩm của bạn đã được bán thành công.</p>
      
      <div class="product-info">
        <div class="product-title">${productTitle}</div>
        ${
          productImage
            ? `<img src="${productImage}" alt="${productTitle}" class="product-image" />`
            : ''
        }
        
        <div class="info-row">
          <span class="info-label">Giá sản phẩm:</span>
          <span class="info-value">${formattedUnitPrice} VNĐ</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phí vận chuyển:</span>
          <span class="info-value">${formattedShippingFee} VNĐ</span>
        </div>
      </div>

      <div class="total-row">
        <span>Tổng tiền hàng:</span>
        <span>${formattedUnitPrice} VNĐ</span>
      </div>

      <div class="buyer-info">
        <h3>👤 Thông tin người mua</h3>
        <div class="buyer-detail">
          <strong>Họ và tên:</strong> ${buyerName}
        </div>
        <div class="buyer-detail">
          <strong>Số điện thoại:</strong> ${buyerPhone}
        </div>
        <div class="buyer-detail">
          <strong>Địa chỉ giao hàng:</strong> ${buyerAddress}
        </div>
      </div>

      <div class="order-code">
        <div class="order-code-label">Mã đơn hàng:</div>
        <div class="order-code-value">${orderCode}</div>
      </div>

      <div class="shipping-info">
        <h3>🚚 Thông tin vận chuyển</h3>
        <p><strong>Đơn vị vận chuyển:</strong> GHN (Giao Hàng Nhanh)</p>
        <p><strong>Mã vận đơn:</strong> ${orderCode}</p>
        <p>Vui lòng chuẩn bị hàng và chờ GHN đến lấy. Bạn sẽ nhận được thông báo khi đơn vị vận chuyển đến lấy hàng.</p>
      </div>

      <p style="margin-top: 30px;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
      <p>Trân trọng,<br><strong>Đội ngũ EV Marketplace</strong></p>
    </div>
    <div class="footer">
      <p>Email này được gửi tự động, vui lòng không trả lời.</p>
      <p>&copy; ${new Date().getFullYear()} EV Marketplace. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

  const mailOptions = {
    from: `"EV Marketplace" <${process.env.EMAIL_USER}>`,
    to: sellerEmail,
    subject: `🎉 Bán hàng thành công - Mã đơn hàng ${orderCode}`,
    html: htmlContent,
  };

  try {
    // Prefer SendGrid HTTP if configured
    if (String(process.env.EMAIL_PROVIDER || '').toLowerCase() === 'sendgrid') {
      await sendViaSendGrid(
        sellerEmail,
        `🎉 Bán hàng thành công - Mã đơn hàng ${orderCode}`,
        htmlContent
      );
      console.log('✅ Seller notification email sent via SendGrid');
      return { success: true };
    }
    // SMTP fallback (requires EMAIL_USER/PASSWORD and reachable SMTP)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn(
        '⚠️ Email not configured, skipping seller notification email'
      );
      return { success: false, error: 'Email not configured' };
    }
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Seller notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(
      '❌ Failed to send seller notification email:',
      error.message
    );
    return { success: false, error: error.message };
  }
}

/**
 * Send meeting schedule notification to buyer and seller
 * @param {Object} params - Email parameters
 * @param {string} params.recipientEmail - Recipient's email address
 * @param {string} params.recipientName - Recipient's name
 * @param {string} params.recipientRole - 'buyer' or 'seller'
 * @param {string} params.productTitle - Product title
 * @param {string} params.orderNumber - Order number
 * @param {Date} params.meetingTime - Meeting date and time
 * @param {string} params.meetingLocation - Meeting location
 * @param {string} params.meetingAddress - Meeting address
 * @param {boolean} params.wasSuggestion - Whether this was confirming a buyer suggestion
 */
export async function sendMeetingScheduleNotification({
  recipientEmail,
  recipientName,
  recipientRole,
  productTitle,
  orderNumber,
  meetingTime,
  meetingLocation,
  meetingAddress,
  wasSuggestion = false,
}) {
  const formattedDate = meetingTime
    ? new Intl.DateTimeFormat('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(meetingTime))
    : 'Chưa xác định';

  const roleText = recipientRole === 'buyer' ? 'người mua' : 'người bán';
  const confirmationText = wasSuggestion
    ? 'Admin đã xác nhận thông tin buổi hẹn mà bạn đã đề xuất trước đó.'
    : 'Admin đã lên lịch buổi hẹn cho giao dịch của bạn.';

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thông báo lịch hẹn giao dịch</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: #fff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .meeting-info { background: #f0f9ff; border-left: 4px solid #4CAF50; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .meeting-info h3 { margin-top: 0; color: #2e7d32; }
    .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
    .info-row:last-child { border-bottom: none; }
    .info-icon { font-size: 20px; margin-right: 10px; min-width: 30px; }
    .info-content { flex: 1; }
    .info-label { font-weight: 600; color: #666; font-size: 14px; }
    .info-value { color: #333; font-size: 16px; margin-top: 5px; }
    .order-box { background: #fff3cd; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
    .order-number { font-size: 20px; font-weight: bold; color: #856404; }
    .important-note { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .important-note strong { color: #c62828; }
    .footer { background: #f4f4f4; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    .icon { font-size: 48px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">📅</div>
      <h1>Thông báo lịch hẹn giao dịch</h1>
    </div>
    <div class="content">
      <div class="greeting">Xin chào <strong>${recipientName}</strong>,</div>
      <p>${confirmationText}</p>
      
      <div class="order-box">
        <div style="color: #856404; font-size: 14px;">Mã đơn hàng</div>
        <div class="order-number">${orderNumber}</div>
      </div>

      <div class="meeting-info">
        <h3>📍 Thông tin buổi hẹn</h3>
        
        ${
          meetingTime
            ? `
        <div class="info-row">
          <div class="info-icon">🕐</div>
          <div class="info-content">
            <div class="info-label">Thời gian</div>
            <div class="info-value">${formattedDate}</div>
          </div>
        </div>
        `
            : ''
        }
        
        ${
          meetingLocation
            ? `
        <div class="info-row">
          <div class="info-icon">🏢</div>
          <div class="info-content">
            <div class="info-label">Địa điểm</div>
            <div class="info-value">${meetingLocation}</div>
          </div>
        </div>
        `
            : ''
        }
        
        ${
          meetingAddress
            ? `
        <div class="info-row">
          <div class="info-icon">📮</div>
          <div class="info-content">
            <div class="info-label">Địa chỉ chi tiết</div>
            <div class="info-value">${meetingAddress}</div>
          </div>
        </div>
        `
            : ''
        }
        
        <div class="info-row">
          <div class="info-icon">🚗</div>
          <div class="info-content">
            <div class="info-label">Sản phẩm</div>
            <div class="info-value">${productTitle}</div>
          </div>
        </div>
      </div>

      <div class="important-note">
        <strong>⚠️ Lưu ý quan trọng:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Vui lòng có mặt đúng giờ để buổi giao dịch diễn ra suôn sẻ</li>
          <li>Mang theo giấy tờ tùy thân để xác minh</li>
          <li>Kiểm tra kỹ sản phẩm trước khi hoàn tất giao dịch</li>
          ${
            recipientRole === 'buyer'
              ? '<li>Chuẩn bị đầy đủ số tiền còn lại để thanh toán</li>'
              : ''
          }
          ${
            recipientRole === 'seller'
              ? '<li>Mang theo đầy đủ giấy tờ xe và hồ sơ liên quan</li>'
              : ''
          }
          <li>Nếu không thể tham dự, vui lòng liên hệ admin ngay lập tức</li>
        </ul>
      </div>

      <p style="margin-top: 20px;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline hỗ trợ.</p>
      
      <p style="margin-top: 20px;">Trân trọng,<br><strong>Đội ngũ Electric Vehicle Marketplace</strong></p>
    </div>
    <div class="footer">
      <p>Email này được gửi tự động, vui lòng không trả lời trực tiếp.</p>
      <p>© ${new Date().getFullYear()} Electric Vehicle Marketplace. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const subject = wasSuggestion
    ? `✅ Xác nhận lịch hẹn - ${orderNumber}`
    : `📅 Thông báo lịch hẹn giao dịch - ${orderNumber}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject,
    html: htmlContent,
  };

  try {
    // Try SendGrid first
    if (process.env.SENDGRID_API_KEY) {
      await sendViaSendGrid(recipientEmail, subject, htmlContent);
      console.log(
        `✅ Meeting schedule email sent to ${recipientRole} via SendGrid`
      );
      return { success: true };
    }
    // SMTP fallback
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn(
        '⚠️ Email not configured, skipping meeting schedule notification'
      );
      return { success: false, error: 'Email not configured' };
    }
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✅ Meeting schedule email sent to ${recipientRole}:`,
      info.messageId
    );
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(
      `❌ Failed to send meeting schedule email to ${recipientRole}:`,
      error.message
    );
    return { success: false, error: error.message };
  }
}

export default {
  sendBuyerOrderConfirmation,
  sendSellerOrderNotification,
  sendMeetingScheduleNotification,
};
