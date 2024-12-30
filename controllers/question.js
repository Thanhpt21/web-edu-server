const Question = require("../models/question");
const asyncHandler = require("express-async-handler");

const createQuestion = asyncHandler(async (req, res) => {
  const {
    question_title,
    correct_answer,
    question_type,
    lesson_id,
    answer_a,
    answer_b,
    answer_c,
    answer_d,
    correct_answer_text,
  } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!question_title || !question_type || !lesson_id) {
    return res
      .status(400)
      .json({ success: false, message: "Missing or invalid input" });
  }

  // Kiểm tra đáp án cho từng loại câu hỏi
  if (question_type === "multiple_choice") {
    if (!answer_a || !answer_b || !answer_c || !answer_d) {
      return res.status(400).json({
        success: false,
        message: "All answers A, B, C, D are required for multiple choice",
      });
    }
  } else if (["short_answer", "fill_in_the_blank"].includes(question_type)) {
    // Kiểm tra `correct_answer_text` đối với câu hỏi `short_answer` và `fill_in_the_blank`
    if (!correct_answer_text) {
      return res.status(400).json({
        success: false,
        message:
          "Correct answer text is required for short answer or fill in the blank",
      });
    }
  }

  // Nếu câu hỏi không phải loại `short_answer` hoặc `fill_in_the_blank`, thì yêu cầu `correct_answer`
  if (
    !["short_answer", "fill_in_the_blank"].includes(question_type) &&
    !correct_answer
  ) {
    return res.status(400).json({
      success: false,
      message: "Correct answer is required for this question type",
    });
  }

  try {
    // Tạo câu hỏi mới
    const newQuestion = new Question({
      question_title,
      correct_answer,
      question_type,
      lesson_id,
      answer_a,
      answer_b,
      answer_c,
      answer_d,
      correct_answer_text,
    });

    await newQuestion.save();

    res.status(200).json({
      success: true,
      message: "Câu hỏi đã được tạo thành công",
      question: newQuestion,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cập nhật câu hỏi
const updateQuestion = asyncHandler(async (req, res) => {
  const { qid } = req.params;
  const {
    question_title,
    correct_answer,
    question_type,
    answer_a,
    answer_b,
    answer_c,
    answer_d,
    correct_answer_text,
  } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!question_title || !question_type) {
    return res
      .status(400)
      .json({ success: false, message: "Missing or invalid input" });
  }

  // Kiểm tra đáp án cho các loại câu hỏi
  if (question_type === "multiple_choice") {
    if (!answer_a || !answer_b || !answer_c || !answer_d) {
      return res.status(400).json({
        success: false,
        message: "All answers A, B, C, D are required for multiple choice",
      });
    }
  } else if (["short_answer", "fill_in_the_blank"].includes(question_type)) {
    // Kiểm tra `correct_answer_text` đối với câu hỏi `short_answer` và `fill_in_the_blank`
    if (!correct_answer_text) {
      return res.status(400).json({
        success: false,
        message:
          "Correct answer text is required for short answer or fill in the blank",
      });
    }
  }

  // Nếu câu hỏi không phải loại `short_answer` hoặc `fill_in_the_blank`, thì yêu cầu `correct_answer`
  if (
    !["short_answer", "fill_in_the_blank"].includes(question_type) &&
    !correct_answer
  ) {
    return res.status(400).json({
      success: false,
      message: "Correct answer is required for this question type",
    });
  }

  // Tạo đối tượng updateFields với các giá trị cần cập nhật
  const updateFields = {
    question_title,
    correct_answer,
    question_type,
    answer_a,
    answer_b,
    answer_c,
    answer_d,
    correct_answer_text,
  };

  // Lọc các trường không cần thiết (nếu không có giá trị sẽ loại bỏ)
  for (let key in updateFields) {
    if (updateFields[key] === undefined || updateFields[key] === null) {
      delete updateFields[key];
    }
  }

  try {
    // Cập nhật câu hỏi
    const updatedQuestion = await Question.findByIdAndUpdate(
      qid,
      updateFields,
      {
        new: true,
      }
    );

    // Nếu câu hỏi không tồn tại
    if (!updatedQuestion) {
      return res.status(404).json({
        success: false,
        message: "Câu hỏi không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Câu hỏi đã được cập nhật thành công",
      question: updatedQuestion,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Lấy danh sách câu hỏi
const getQuestions = asyncHandler(async (req, res) => {
  const queryObj = { ...req.query };
  const excludeFields = ["page", "sort", "limit", "fields"];
  excludeFields.forEach((el) => delete queryObj[el]);
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let formatedQueryObj = JSON.parse(queryStr);

  if (queryObj?.question_title) {
    formatedQueryObj.question_title = {
      $regex: queryObj.question_title,
      $options: "i",
    };
  }

  let query = Question.find(formatedQueryObj);

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-created_at");
  }

  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  const page = +req.query.page || 1;
  const limit = +req.query.limit || 8;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  try {
    const response = await query.exec();
    const counts = await Question.find(formatedQueryObj).countDocuments();
    res.status(200).json({
      success: true,
      questions: response,
      counts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Lấy thông tin câu hỏi theo id
const getQuestion = asyncHandler(async (req, res) => {
  const { qid } = req.params;
  const question = await Question.findById(qid);

  if (!question) {
    return res
      .status(404)
      .json({ success: false, message: "Câu hỏi không tồn tại" });
  }

  res.status(200).json({
    success: true,
    question,
  });
});

// Xóa câu hỏi
const deleteQuestion = asyncHandler(async (req, res) => {
  const { qid } = req.params;
  try {
    const response = await Question.findByIdAndDelete(qid);
    res.status(200).json({
      success: response ? true : false,
      message: response ? "Xóa câu hỏi thành công" : "Đã xảy ra lỗi",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = {
  createQuestion,
  updateQuestion,
  getQuestions,
  getQuestion,
  deleteQuestion,
};
