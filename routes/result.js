const express = require("express");
const router = express.Router();
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const {
  createResult,
  getResults,
  getResultById,
  updateResult,
  deleteResult,
} = require("../controllers/result");

// Tạo kết quả thi mới
router.post(
  "/",
  verifyAccessToken, // Kiểm tra token
  isAdmin, // Kiểm tra quyền admin
  createResult
);

// Lấy tất cả kết quả thi (có thể sử dụng query để lọc theo user_id hoặc quiz_id)
router.get("/", getResults);

// Lấy kết quả thi theo ID
router.get("/:id", getResultById);

// Cập nhật kết quả thi theo ID
router.put("/:id", verifyAccessToken, isAdmin, updateResult);

// Xóa kết quả thi theo ID
router.delete("/:id", verifyAccessToken, isAdmin, deleteResult);

module.exports = router;
