import crypto from 'crypto';
import moment from 'moment';
import axios from 'axios';
import dotenv from 'dotenv';
// Ensure env vars are loaded even if this module is imported before index.ts sets them up
dotenv.config();

// ZaloPay Sandbox Configuration
export const ZALOPAY_CONFIG = {
    app_id: process.env.ZALOPAY_APP_ID,
    key1: process.env.ZALOPAY_KEY1,
    key2: process.env.ZALOPAY_KEY2,
    endpoint: "https://sb-openapi.zalopay.vn/v2/create",
    query_endpoint: "https://sb-openapi.zalopay.vn/v2/query",
    callback_url: process.env.ZALOPAY_CALLBACK_URL
};

function assertConfig() {
    const { app_id, key1, key2, callback_url } = ZALOPAY_CONFIG;
    if (!app_id || !key1 || !key2 || !callback_url) {
        throw new Error("Missing ZaloPay ENV. Required: ZALOPAY_APP_ID, ZALOPAY_KEY1, ZALOPAY_KEY2, ZALOPAY_CALLBACK_URL");
    }
}

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
        assertConfig();
        // Build values following ZaloPay spec constraints
        // app_trans_id must be in format YYMMDD_XXXXX (one underscore, limited length, safe chars)
        const uniqueNumeric = `${Date.now()}`.slice(-10); // last 10 digits
        const app_trans_id = `${moment().format("YYMMDD")}_${uniqueNumeric}`;

        // app_user: only [A-Za-z0-9_], reasonable length
        const rawUser = `user_${userId}`;
        const app_user_sanitized = rawUser.replace(/[^A-Za-z0-9_]/g, '').slice(0, 32);
        // Use minimal embed_data and item to avoid validation issues
        const embed_data = {};
        const item = [];

        const orderData = {
            app_id: Number(ZALOPAY_CONFIG.app_id),
            app_trans_id,
            app_user: app_user_sanitized,
            app_time: Date.now(),
            item: JSON.stringify(item),
            embed_data: JSON.stringify(embed_data),
            amount: Number(amount),
            description: String(description || `Nạp ${amount} xu vào ví`).slice(0, 200),
            bank_code: "",
            callback_url: ZALOPAY_CONFIG.callback_url,
        };

        // Create MAC signature
        const dataStr = [
            Number(ZALOPAY_CONFIG.app_id),
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
                error: response.data.return_message || 'Unknown error',
                zalopay: response.data
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
