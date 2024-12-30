const mongoose = require("mongoose");

var quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // Tiêu đề bài thi là bắt buộc
    },
    description: {
      type: String,
      required: true, // Mô tả bài thi là bắt buộc
    },
    lesson_ids: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Lesson", // Tham chiếu đến bảng bài học (Lesson)
      required: true, // Danh sách các bài học liên quan là bắt buộc
    },
    duration_minutes: {
      type: Number,
      required: true, // Thời gian thi tính bằng phút là bắt buộc
      min: 1, // Thời gian thi tối thiểu là 1 phút
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

module.exports = mongoose.model("Quiz", quizSchema);
