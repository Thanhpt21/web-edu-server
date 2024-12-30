const asyncHandler = require("express-async-handler");
const Quiz = require("../models/quiz");

// Tạo bài thi mới
const createQuiz = asyncHandler(async (req, res) => {
  const { title, description, lesson_ids, duration_minutes } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!title || !description || !lesson_ids || !duration_minutes) {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid input",
    });
  }

  try {
    const newQuiz = new Quiz({
      title,
      description,
      lesson_ids,
      duration_minutes,
    });

    await newQuiz.save();

    res.status(200).json({
      success: true,
      message: "Bài thi đã được tạo thành công",
      quiz: newQuiz,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Lấy tất cả bài thi
const getQuizzes = asyncHandler(async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.status(200).json({
      success: true,
      quizzes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Lấy bài thi theo ID
const getQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  try {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cập nhật bài thi theo ID
const updateQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { title, description, lesson_ids, duration_minutes } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!title || !description || !lesson_ids || !duration_minutes) {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid input",
    });
  }

  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { title, description, lesson_ids, duration_minutes },
      { new: true }
    );

    if (!updatedQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Bài thi đã được cập nhật thành công",
      quiz: updatedQuiz,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Xóa bài thi theo ID
const deleteQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  try {
    const deletedQuiz = await Quiz.findByIdAndDelete(quizId);

    if (!deletedQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Bài thi đã được xóa thành công",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = {
  createQuiz,
  getQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
};
