import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GHN_BASE_URL = process.env.GHN_BASE_URL || "https://dev-online-gateway.ghn.vn/shiip/public-api";

export const ghnClient = axios.create({
  baseURL: GHN_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    // Cloudflare sometimes blocks requests without a browser-like UA
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
    // Extra headers to reduce Cloudflare bot challenges
    "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
    Origin: "https://dev-online-gateway.ghn.vn",
    Referer: "https://dev-online-gateway.ghn.vn/",
  },
  timeout: 15000,
});

export function getGhnHeaders(shopIdOverride = null) {
  const token = process.env.GHN_TOKEN;
  const shopId = shopIdOverride || process.env.GHN_SHOP_ID;
  if (!token || !shopId) {
    throw new Error("Missing GHN_TOKEN or GHN_SHOP_ID in environment");
  }
  return {
    Token: token,
    ShopId: shopId,
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
    "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
    Origin: "https://dev-online-gateway.ghn.vn",
    Referer: "https://dev-online-gateway.ghn.vn/",
  };
}

/**
 * Map GHN status to system order status
 * @param {string} ghnStatus - GHN status code (e.g., "st_delivered_success", "picking")
 * @returns {string|null} - System status ("delivered", "cancelled", "refunded", "shipped", "pending") or null if no mapping
 */
export function mapGhnStatusToSystemStatus(ghnStatus) {
  if (!ghnStatus) return null;
  const status = ghnStatus.toLowerCase().trim();
  
  // Delivered statuses
  if (["delivered", "completed", "st_delivered_success", "delivered_success"].includes(status)) return "delivered";
  
  // Cancelled statuses - include "cancel" (without 'led')
  if (["cancelled", "cancel", "st_cancel", "canceled"].includes(status)) return "cancelled";
  
  // Return/Refund statuses
  if (["return_transporting", "returning", "return_sorting", "st_return_transporting", "return"].includes(status)) return "refunded";
  
  // Shipped/Shipping statuses
  if (["picking", "picked", "st_picked_success", "transporting", "sorting", "delivering", "st_transporting", "shipping", "on_delivery"].includes(status)) return "shipped";
  
  // Pending statuses
  if (["pending", "ready_to_pick", "ready_to_ship", "st_ready_to_pick", "preparing"].includes(status)) return "pending";
  
  // Log unmapped status for debugging
  console.warn(`[GHN Status Mapping] Unmapped status: "${ghnStatus}"`);
  return null;
}

