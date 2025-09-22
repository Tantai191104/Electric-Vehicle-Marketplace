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
  },
  timeout: 15000,
});

export function getGhnHeaders() {
  const token = process.env.GHN_TOKEN;
  const shopId = process.env.GHN_SHOP_ID;
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
  };
}


