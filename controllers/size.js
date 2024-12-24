const Size = require("../models/size"); // Import mô hình Size
const asyncHandler = require("express-async-handler");

// Tạo Size mới
const createSize = asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title) throw new Error("Missing input");

  const response = await Size.create(req.body);
  res.status(200).json({
    success: response ? true : false,
    message: response ? "Tạo kích thước thành công" : "Đã xảy ra lỗi",
  });
});

// Lấy danh sách các Size (Có hỗ trợ phân trang, tìm kiếm)
const getSizes = asyncHandler(async (req, res) => {
  const queryObj = { ...req.query };
  const excludeFields = ["page", "sort", "limit", "fields"];
  excludeFields.forEach((el) => delete queryObj[el]);
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let formatedQueryObj = JSON.parse(queryStr);

  if (req.query.q) {
    delete formatedQueryObj.q;
    formatedQueryObj["$or"] = [
      { title: { $regex: req.query.q, $options: "i" } },
    ];
  }

  let query = Size.find(formatedQueryObj);

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
    const counts = await Size.find(formatedQueryObj).countDocuments();
    res.status(200).json({
      success: response ? true : false,
      sizes: response ? response : "Đã xảy ra lỗi",
      counts,
    });
  });
});

// Lấy tất cả Size
const getAllSizes = asyncHandler(async (req, res) => {
  const response = await Size.find();
  res.status(200).json({
    success: response ? true : false,
    sizes: response ? response : "Đã xảy ra lỗi",
  });
});

// Lấy một Size theo id
const getSize = asyncHandler(async (req, res) => {
  const { sid } = req.params;
  const response = await Size.findById(sid);
  res.status(200).json({
    success: response ? true : false,
    size: response ? response : "Đã xảy ra lỗi",
  });
});

// Cập nhật một Size
const updateSize = asyncHandler(async (req, res) => {
  const { sid } = req.params;
  const response = await Size.findByIdAndUpdate(sid, req.body, {
    new: true,
  });
  res.status(200).json({
    success: response ? true : false,
    message: response ? "Cập nhật kích thước thành công" : "Đã xảy ra lỗi",
  });
});

// Xóa một Size
const deleteSize = asyncHandler(async (req, res) => {
  const { sid } = req.params;
  const response = await Size.findByIdAndDelete(sid);
  res.status(200).json({
    success: response ? true : false,
    message: response ? "Xóa kích thước thành công" : "Đã xảy ra lỗi",
  });
});

module.exports = {
  createSize,
  getSizes,
  getSize,
  updateSize,
  deleteSize,
  getAllSizes,
};
