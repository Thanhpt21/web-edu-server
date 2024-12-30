const LessonCategory = require("../models/lessoncategory");
const asyncHandler = require("express-async-handler");

// Tạo mới một Lesson Category
const createLessonCategory = asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title) throw new Error("Missing input");

  const response = await LessonCategory.create(req.body);
  res.status(200).json({
    success: response ? true : false,
    message: response ? "Tạo thành công" : "Đã xảy ra lỗi",
  });
});

// Lấy danh sách Lesson Category
const getLessonCategories = asyncHandler(async (req, res) => {
  const queryObj = { ...req.query };
  const excludeFields = ["page", "sort", "limit", "fields"];
  excludeFields.forEach((el) => delete queryObj[el]);
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let formatedQueryObj = JSON.parse(queryStr);

  if (queryObj?.title)
    formatedQueryObj.title = { $regex: queryObj.title, $options: "i" };

  if (req.query.q) {
    delete formatedQueryObj.q;
    formatedQueryObj["$or"] = [
      { title: { $regex: req.query.q, $options: "i" } },
    ];
  }

  let query = LessonCategory.find(formatedQueryObj);

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Limiting the fields
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  const page = +req.query.page || 1;
  const limit = +req.query.limit || 4;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  query.exec(async (err, response) => {
    if (err) throw new Error(err.message);
    const counts = await LessonCategory.find(formatedQueryObj).countDocuments();
    res.status(200).json({
      success: response ? true : false,
      lessonCategories: response ? response : "Đã xảy ra lỗi",
      counts,
    });
  });
});

// Lấy tất cả Lesson Categories
const getLessonCategorys = asyncHandler(async (req, res) => {
  const response = await LessonCategory.find();
  res.status(200).json({
    success: response ? true : false,
    lessonCategoryData: response ? response : "Đã xảy ra lỗi",
  });
});

// Lấy Lesson Category theo ID
const getLessonCategory = asyncHandler(async (req, res) => {
  const { lcId } = req.params;
  const response = await LessonCategory.findById(lcId);
  res.status(200).json({
    success: response ? true : false,
    lessonCategoryData: response ? response : "Đã xảy ra lỗi",
  });
});

// Cập nhật Lesson Category
const updateLessonCategory = asyncHandler(async (req, res) => {
  const { lcId } = req.params;
  const response = await LessonCategory.findByIdAndUpdate(lcId, req.body, {
    new: true,
  });
  res.status(200).json({
    success: response ? true : false,
    message: response ? "Cập nhật thành công" : "Đã xảy ra lỗi",
  });
});

// Xóa Lesson Category
const deleteLessonCategory = asyncHandler(async (req, res) => {
  const { lcId } = req.params;
  const response = await LessonCategory.findByIdAndDelete(lcId);
  res.status(200).json({
    success: response ? true : false,
    message: response ? "Xóa thành công" : "Đã xảy ra lỗi",
  });
});

module.exports = {
  createLessonCategory,
  getLessonCategories,
  getLessonCategorys,
  getLessonCategory,
  updateLessonCategory,
  deleteLessonCategory,
};
