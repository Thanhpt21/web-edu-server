const express = require("express");
const router = express.Router();
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const uploader = require("../config/cloudinary.config");
const {
  createLesson,
  getLessons,
  getLesson,
  updateLesson,
  deleteLesson,
} = require("../controllers/lesson");

// Tạo bài học mới
router.post(
  "/",
  verifyAccessToken,
  isAdmin,
  uploader.single("images"),
  createLesson
);

// Lấy tất cả bài học
router.get("/", getLessons);

// Lấy bài học theo ID
router.get("/:lid", getLesson);

// Cập nhật bài học theo ID
router.put(
  "/:lid",
  [verifyAccessToken, isAdmin],
  uploader.single("images"),
  updateLesson
);

// Xóa bài học theo ID
router.delete("/:lid", [verifyAccessToken, isAdmin], deleteLesson);

module.exports = router;
