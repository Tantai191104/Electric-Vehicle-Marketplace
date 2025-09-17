import multer from "multer";

const storage = multer.memoryStorage();

export const productUpload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10
  }
});

export const chatFileUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5
  }
});
