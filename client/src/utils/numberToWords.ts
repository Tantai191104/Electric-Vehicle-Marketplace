import {
  InvalidNumberError,
  ReadingConfig,
  doReadNumber,
} from "read-vietnamese-number";

// Tạo config đọc số
const config = new ReadingConfig();
config.unit = ["đồng"]; // thêm đơn vị cuối

function numberToVietnameseWords(amount: number): string {
  try {
    return doReadNumber(amount.toString(), config);
  } catch (err) {
    if (err instanceof InvalidNumberError) {
      console.error("Số không hợp lệ");
      return "";
    }
    throw err;
  }
}
export default numberToVietnameseWords;
