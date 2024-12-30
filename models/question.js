const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question_title: {
      type: String,
      required: [true, "Question title is required"],
    },
    correct_answer: {
      type: String,
      required: function () {
        return (
          this.question_type !== "short_answer" &&
          this.question_type !== "fill_in_the_blank"
        );
      },
    },
    question_type: {
      type: String,
      required: [true, "Question type is required"],
      enum: [
        "multiple_choice",
        "true_false",
        "short_answer",
        "fill_in_the_blank",
        "multiple_answers",
      ],
    },
    lesson_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: [true, "Lesson ID is required"],
    },
    answer_a: {
      type: String,
      required: function () {
        return this.question_type === "multiple_choice";
      },
    },
    answer_b: {
      type: String,
      required: function () {
        return this.question_type === "multiple_choice";
      },
    },
    answer_c: {
      type: String,
      required: function () {
        return this.question_type === "multiple_choice";
      },
    },
    answer_d: {
      type: String,
      required: function () {
        return this.question_type === "multiple_choice";
      },
    },
    correct_answer_text: {
      type: String,
      required: function () {
        return (
          this.question_type === "short_answer" ||
          this.question_type === "fill_in_the_blank"
        );
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
