import crypto from 'crypto';
import moment from 'moment';
import axios from 'axios';

// ZaloPay Sandbox Configuration
export const ZALOPAY_CONFIG = {
  app_id: process.env.app_id,
  key1: process.env.key1,
  key2: process.env.key2,
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
  query_endpoint: "https://sb-openapi.zalopay.vn/v2/query",
  callback_url: process.env.ZALOPAY_CALLBACK_URL
};

/**
 * Generate MAC signature for ZaloPay
 */
export function generateMAC(data, key) {
  return crypto.createHmac("sha256", key).update(data).digest("hex");
}

/**
 * Create ZaloPay order
 */
export async function createZaloPayOrder({
  orderId,
  amount,
  description,
  userId
}) {
  try {
    const app_trans_id = `${moment().format("YYMMDD")}_${orderId}`;
    const embed_data = {
      userId,
      type: 'wallet_topup'
    };
    const item = [{
      itemid: "wallet_coins",
      itemname: "Nạp xu vào ví",
      itemprice: amount,
      itemquantity: 1
    }];

    const orderData = {
      app_id: ZALOPAY_CONFIG.app_id,
      app_trans_id,
      app_user: `user_${userId}`,
      app_time: Date.now(),
      item: JSON.stringify(item),
      embed_data: JSON.stringify(embed_data),
      amount,
      description: description || `Nạp ${amount} xu vào ví`,
      bank_code: "",
      callback_url: ZALOPAY_CONFIG.callback_url,
    };

    // Create MAC signature
    const dataStr = [
      ZALOPAY_CONFIG.app_id,
      orderData.app_trans_id,
      orderData.app_user,
      orderData.amount,
      orderData.app_time,
      orderData.embed_data,
      orderData.item
    ].join("|");

    orderData.mac = generateMAC(dataStr, ZALOPAY_CONFIG.key1);

    // Call ZaloPay API with x-www-form-urlencoded body
    const form = new URLSearchParams();
    Object.entries(orderData).forEach(([key, value]) => {
      form.append(key, String(value));
    });

    const response = await axios.post(ZALOPAY_CONFIG.endpoint, form.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      // Avoid axios converting to JSON
      transformRequest: [(data) => data]
    });

    if (response.data.return_code === 1) {
      return {
        success: true,
        data: {
          order_url: response.data.order_url,
          app_trans_id,
          zp_trans_token: response.data.zp_trans_token,
          order_token: response.data.order_token
        }
      };
    } else {
      return {
        success: false,
        error: response.data.return_message || 'Unknown error'
      };
    }
  } catch (error) {
    console.error('ZaloPay create order error:', error?.response?.data || error.message);
    return {
      success: false,
      error: error?.response?.data?.return_message || error.message,
      details: error?.response?.data
    };
  }
}

/**
 * Query ZaloPay order status
 */
export async function queryZaloPayOrder(app_trans_id) {
  try {
    const data = `${ZALOPAY_CONFIG.app_id}|${app_trans_id}|${ZALOPAY_CONFIG.key1}`;
    const mac = generateMAC(data, ZALOPAY_CONFIG.key1);

    const response = await axios.post(ZALOPAY_CONFIG.query_endpoint, null, {
      params: {
        app_id: ZALOPAY_CONFIG.app_id,
        app_trans_id,
        mac
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('ZaloPay query order error:', error?.response?.data || error.message);
    return {
      success: false,
      error: error?.response?.data?.return_message || error.message
    };
  }
}

/**
 * Validate callback MAC
 */
export function validateCallbackMAC(data, mac) {
  const macCheck = generateMAC(data, ZALOPAY_CONFIG.key2);
  return mac === macCheck;
}
