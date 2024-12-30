// models/history.js
const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến bảng người dùng
      required: true,
    },
    quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz", // Tham chiếu đến bảng bài thi
      required: true,
    },
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "in_progress", "failed"], // Trạng thái thi
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true, // Thêm thời gian tạo và cập nhật
  }
);

module.exports = mongoose.model("History", historySchema);
