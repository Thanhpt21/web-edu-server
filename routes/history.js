// routes/historyRoutes.js
const express = require("express");
const router = express.Router();
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken"); // Nếu cần bảo vệ đường dẫn
const {
  createHistory,
  getHistories,
  getHistory,
  updateHistory,
  deleteHistory,
} = require("../controllers/history");

// Tạo lịch sử thi
router.post(
  "/",
  verifyAccessToken, // Xác thực người dùng
  createHistory
);

// Lấy tất cả lịch sử thi
router.get("/", getHistories);

// Lấy lịch sử thi theo ID
router.get("/:historyId", getHistory);

// Cập nhật lịch sử thi
router.put(
  "/:historyId",
  [verifyAccessToken, isAdmin], // Chỉ cho phép admin cập nhật
  updateHistory
);

// Xóa lịch sử thi
router.delete(
  "/:historyId",
  [verifyAccessToken, isAdmin], // Chỉ cho phép admin xóa
  deleteHistory
);

module.exports = router;
