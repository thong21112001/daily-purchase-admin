import mongoose from "mongoose";

/**
 * Kiểm tra xem một chuỗi có phải là MongoDB ObjectId hợp lệ hay không
 */
export function isValidObjectId(id: string | null | undefined): boolean {
  if (!id || typeof id !== "string") return false;
  return mongoose.Types.ObjectId.isValid(id.trim());
}
