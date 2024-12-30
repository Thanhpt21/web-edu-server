const express = require("express");
const router = express.Router();
const {
  createLessonCategory,
  getLessonCategories,
  getLessonCategorys,
  getLessonCategory,
  updateLessonCategory,
  deleteLessonCategory,
} = require("../controllers/lessoncategory");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

// Tạo Lesson Category mới
router.post("/", [verifyAccessToken, isAdmin], createLessonCategory);

// Lấy danh sách tất cả Lesson Categories
router.get("/", getLessonCategories);

// Lấy tất cả Lesson Categories
router.get("/all", getLessonCategorys);

// Lấy thông tin chi tiết Lesson Category theo ID
router.get("/:lcId", getLessonCategory);

// Cập nhật Lesson Category
router.put("/:lcId", [verifyAccessToken, isAdmin], updateLessonCategory);

// Xóa Lesson Category
router.delete("/:lcId", [verifyAccessToken, isAdmin], deleteLessonCategory);

module.exports = router;
