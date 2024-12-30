const express = require("express");
const router = express.Router();
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken"); // Nếu có bảo vệ bảo mật
const {
  createQuiz,
  getQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
} = require("../controllers/quiz");

// Tạo bài thi mới
router.post(
  "/",
  [verifyAccessToken, isAdmin], // Bảo vệ đường dẫn với token và quyền admin
  createQuiz
);

// Lấy tất cả bài thi
router.get("/", getQuizzes);

// Lấy bài thi theo ID
router.get("/:quizId", getQuiz);

// Cập nhật bài thi theo ID
router.put(
  "/:quizId",
  [verifyAccessToken, isAdmin], // Bảo vệ đường dẫn với token và quyền admin
  updateQuiz
);

// Xóa bài thi theo ID
router.delete(
  "/:quizId",
  [verifyAccessToken, isAdmin], // Bảo vệ đường dẫn với token và quyền admin
  deleteQuiz
);

module.exports = router;
