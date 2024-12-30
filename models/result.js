const mongoose = require("mongoose");

var resultSchema = new mongoose.Schema(
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
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    total_questions: {
      type: Number,
      required: true,
      min: 1,
    },
    correct_answers: {
      type: Number,
      required: true,
      min: 0,
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

module.exports = mongoose.model("Result", resultSchema);
