// controllers/history.js
const asyncHandler = require("express-async-handler");
const History = require("../models/history");
const User = require("../models/user");
const Quiz = require("../models/quiz");

// Tạo lịch sử thi
const createHistory = asyncHandler(async (req, res) => {
  const { user_id, quiz_id, start_time, end_time, status, score } = req.body;

  if (!user_id || !quiz_id || !start_time || !end_time || !status || !score) {
    return res
      .status(400)
      .json({ success: false, message: "Missing or invalid input" });
  }

  try {
    const newHistory = new History({
      user_id,
      quiz_id,
      start_time,
      end_time,
      status,
      score,
    });

    await newHistory.save();

    res.status(201).json({
      success: true,
      message: "History created successfully",
      history: newHistory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Lấy tất cả lịch sử thi
const getHistories = asyncHandler(async (req, res) => {
  try {
    const histories = await History.find()
      .populate("user_id")
      .populate("quiz_id");
    res.status(200).json({
      success: true,
      histories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Lấy lịch sử thi theo ID
const getHistory = asyncHandler(async (req, res) => {
  const { historyId } = req.params;

  try {
    const history = await History.findById(historyId)
      .populate("user_id")
      .populate("quiz_id");
    if (!history) {
      return res
        .status(404)
        .json({ success: false, message: "History not found" });
    }

    res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cập nhật lịch sử thi
const updateHistory = asyncHandler(async (req, res) => {
  const { historyId } = req.params;
  const { status, score } = req.body;

  // Kiểm tra trường hợp status hoặc score có thể bị bỏ qua
  const updateFields = {};
  if (status) updateFields.status = status;
  if (score) updateFields.score = score;

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Missing fields",
    });
  }

  try {
    const updatedHistory = await History.findByIdAndUpdate(
      historyId,
      updateFields,
      { new: true }
    );

    if (!updatedHistory) {
      return res.status(404).json({
        success: false,
        message: "History not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "History updated successfully",
      history: updatedHistory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Xóa lịch sử thi
const deleteHistory = asyncHandler(async (req, res) => {
  const { historyId } = req.params;

  try {
    const deletedHistory = await History.findByIdAndDelete(historyId);
    if (!deletedHistory) {
      return res
        .status(404)
        .json({ success: false, message: "History not found" });
    }

    res.status(200).json({
      success: true,
      message: "History deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = {
  createHistory,
  getHistories,
  getHistory,
  updateHistory,
  deleteHistory,
};
