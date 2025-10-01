import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export function detectResourceType(mime) {
  const m = String(mime || "");
  if (m.startsWith("video")) return "video";
  // Serve PDFs under image to allow inline preview
  if (m.includes("pdf")) return "image";
  return "image";
}

// Helper function to upload with unsigned preset
export async function uploadWithUnsignedPreset(buffer, options = {}) {
  const defaultOptions = {
    resource_type: 'image',
    folder: 'contracts',
    format: 'pdf',
    upload_preset: 'unsigned_contracts'
  };
  
  return new Promise((resolve) => {
    cloudinary.uploader.upload_stream(
      { ...defaultOptions, ...options },
      (err, result) => {
        if (err) return resolve({ success: false, error: err.message });
        resolve({ success: true, url: result.secure_url });
      }
    ).end(buffer);
  });
}

export default cloudinary;