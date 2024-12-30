const Lesson = require("../models/lesson");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

// Tạo bài học mới
const createLesson = asyncHandler(async (req, res) => {
  const { title, description, content, category } = req.body;
  const images = req?.file?.path;

  if (
    !title ||
    !description ||
    !content ||
    !Array.isArray(content) ||
    content.length === 0
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Missing or invalid input" });
  }

  if (!category || !Array.isArray(category)) {
    return res
      .status(400)
      .json({ success: false, message: "Missing or invalid category input" });
  }

  if (images) req.body.images = images;

  // Xử lý dữ liệu content
  let contentArray = content.map((item) => ({
    title: item.title,
    body: item.body,
    imageUrl: item.imageUrl,
    videoUrl: item.videoUrl,
  }));

  try {
    const response = await Lesson.create({
      ...req.body,
      content: contentArray,
    });
    res.status(200).json({
      success: true,
      message: "Bài học đã được tạo thành công",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cập nhật bài học
const updateLesson = asyncHandler(async (req, res) => {
  const { lid } = req.params;
  const { title, description, content, category } = req.body;
  const images = req?.file?.path;

  if (
    !title ||
    !description ||
    !content ||
    !Array.isArray(content) ||
    content.length === 0
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Missing or invalid input" });
  }

  if (!category || !Array.isArray(category)) {
    return res
      .status(400)
      .json({ success: false, message: "Missing or invalid category input" });
  }

  let updatedContent = content.map((item) => ({
    title: item.title,
    body: item.body,
    imageUrl: item.imageUrl,
    videoUrl: item.videoUrl,
  }));

  const updateFields = {
    title,
    description,
    content: updatedContent,
    category,
  };

  if (images) {
    updateFields.images = images;
  }

  try {
    const response = await Lesson.findByIdAndUpdate(lid, updateFields, {
      new: true,
    });
    res.status(200).json({
      success: response ? true : false,
      message: response ? "Cập nhật thành công" : "Đã xảy ra lỗi",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Lấy danh sách bài học
const getLessons = asyncHandler(async (req, res) => {
  const queryObj = { ...req.query };
  const excludeFields = ["page", "sort", "limit", "fields"];
  excludeFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let formatedQueryObj = JSON.parse(queryStr);

  if (queryObj?.title) {
    formatedQueryObj.title = { $regex: queryObj.title, $options: "i" };
  }

  if (queryObj?.category) {
    formatedQueryObj.category = {
      $in: queryObj.category
        .split(",")
        .map((id) => mongoose.Types.ObjectId(id)),
    };
  }

  let query = Lesson.find(formatedQueryObj);

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
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
    const counts = await Lesson.find(formatedQueryObj).countDocuments();
    res.status(200).json({
      success: true,
      lessons: response,
      counts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Lấy thông tin bài học theo id
const getLesson = asyncHandler(async (req, res) => {
  const { lid } = req.params;
  const lesson = await Lesson.findById(lid);

  if (!lesson) {
    return res
      .status(404)
      .json({ success: false, message: "Bài học không tồn tại" });
  }

  res.status(200).json({
    success: true,
    lesson,
  });
});

// Xóa bài học
const deleteLesson = asyncHandler(async (req, res) => {
  const { lid } = req.params;
  try {
    const response = await Lesson.findByIdAndDelete(lid);
    res.status(200).json({
      success: response ? true : false,
      message: response ? "Xóa bài học thành công" : "Đã xảy ra lỗi",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = {
  createLesson,
  updateLesson,
  getLessons,
  getLesson,
  deleteLesson,
};
