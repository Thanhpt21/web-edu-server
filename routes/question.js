const express = require("express");
const router = express.Router();
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const {
  createQuestion,
  getQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/question");

// Tạo câu hỏi mới
router.post("/", verifyAccessToken, isAdmin, createQuestion);

// Lấy tất cả câu hỏi
router.get("/", getQuestions);

// Lấy câu hỏi theo ID
router.get("/:qid", getQuestion);

// Cập nhật câu hỏi theo ID
router.put("/:qid", [verifyAccessToken, isAdmin], updateQuestion);

// Xóa câu hỏi theo ID
router.delete("/:qid", [verifyAccessToken, isAdmin], deleteQuestion);

module.exports = router;
