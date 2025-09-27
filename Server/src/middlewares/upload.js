import multer from "multer";

// Memory storage for both products and chat files (using Cloudinary)
const memoryStorage = multer.memoryStorage();

export const productUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 10 // 10 files
  }
});

export const chatFileUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10 // 10 files
  }
});
