const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
var lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: String,
    },
    content: [
      {
        _id: false,
        title: { type: String, required: true },
        body: { type: String, required: true },
        imageUrl: { type: String, default: "" },
        videoUrl: { type: String, default: "" },
      },
    ],
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LessonCategory", // Tham chiếu đến bảng LessonCategory
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

// Export the model
module.exports = mongoose.model("Lesson", lessonSchema);
