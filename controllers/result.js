const asyncHandler = require("express-async-handler");
const Result = require("../models/result");

// Tạo kết quả thi mới
const createResult = asyncHandler(async (req, res) => {
  const { user_id, quiz_id, score, total_questions, correct_answers } =
    req.body;

  if (!user_id || !quiz_id || !score || !total_questions || !correct_answers) {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid input",
    });
  }

  try {
    const newResult = new Result({
      user_id,
      quiz_id,
      score,
      total_questions,
      correct_answers,
    });

    const savedResult = await newResult.save();

    res.status(201).json({
      success: true,
      message: "Result created successfully",
      result: savedResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Lấy kết quả thi theo user_id hoặc quiz_id
const getResults = asyncHandler(async (req, res) => {
  const { user_id, quiz_id } = req.query;

  let query = {};
  if (user_id) query.user_id = user_id;
  if (quiz_id) query.quiz_id = quiz_id;

  try {
    const results = await Result.find(query).populate("user_id quiz_id");

    res.status(200).json({
      success: true,
      results: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Lấy kết quả thi theo ID
const getResultById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Result.findById(id).populate("user_id quiz_id");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.status(200).json({
      success: true,
      result: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Cập nhật kết quả thi
const updateResult = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { score, total_questions, correct_answers } = req.body;

  try {
    const updatedResult = await Result.findByIdAndUpdate(
      id,
      { score, total_questions, correct_answers },
      { new: true }
    );

    if (!updatedResult) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Result updated successfully",
      result: updatedResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Xóa kết quả thi
const deleteResult = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Result.findById(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    await result.remove();

    res.status(200).json({
      success: true,
      message: "Result deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = {
  createResult,
  getResults,
  getResultById,
  updateResult,
  deleteResult,
};
