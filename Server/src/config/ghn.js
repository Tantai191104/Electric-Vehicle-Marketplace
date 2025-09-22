import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GHN_BASE_URL = process.env.GHN_BASE_URL || "https://dev-online-gateway.ghn.vn/shiip/public-api";

export const ghnClient = axios.create({
  baseURL: GHN_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json, text/plain, */*",
    // Mimic Postman runtime to avoid Cloudflare browser challenges
    "User-Agent": "PostmanRuntime/7.41.2",
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
    "Accept": "application/json, text/plain, */*",
    "User-Agent": "PostmanRuntime/7.41.2",
  };
}


