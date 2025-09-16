import multer from "multer";

const storage = multer.memoryStorage();

export const productUpload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10
  }
});
