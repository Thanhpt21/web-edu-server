const Permission = require("../models/permission"); // Import mô hình Permission
const asyncHandler = require("express-async-handler");

// Tạo quyền mới (Create Permission)
const createPermission = asyncHandler(async (req, res) => {
  const { name, link } = req.body;
  if (!name || !link) throw new Error("Missing input");

  // Kiểm tra xem quyền đã tồn tại chưa
  const permissionExists = await Permission.findOne({ name });
  if (permissionExists) throw new Error("Permission already exists");

  const response = await Permission.create(req.body);
  res.status(200).json({
    success: response ? true : false,
    message: response ? "Tạo quyền thành công" : "Đã xảy ra lỗi",
  });
});

const getAllPermissions = asyncHandler(async (req, res) => {
  const response = await Permission.find();
  res.status(200).json({
    success: response ? true : false,
    permissionData: response ? response : "Đã xảy ra lỗi",
  });
});

// Lấy danh sách tất cả quyền (Get all Permissions)
const getPermissions = asyncHandler(async (req, res) => {
  const queryObj = { ...req.query };
  const excludeFields = ["page", "sort", "limit", "fields"];
  excludeFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let formatedQueryObj = JSON.parse(queryStr);

  if (queryObj?.name)
    formatedQueryObj.name = { $regex: queryObj.name, $options: "i" };

  if (req.query.q) {
    delete formatedQueryObj.q;
    formatedQueryObj["$or"] = [
      { name: { $regex: req.query.q, $options: "i" } },
      { link: { $regex: req.query.q, $options: "i" } },
    ];
  }

  let query = Permission.find(formatedQueryObj);

  // Sắp xếp dữ liệu
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Giới hạn các trường
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  const page = +req.query.page || 1;
  const limit = +req.query.limit || 10;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  query.exec(async (err, response) => {
    if (err) throw new Error(err.message);
    const counts = await Permission.find(formatedQueryObj).countDocuments();
    res.status(200).json({
      success: response ? true : false,
      permissions: response ? response : "Đã xảy ra lỗi",
      counts,
    });
  });
});

// Lấy một quyền theo ID (Get Permission by ID)
const getPermission = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const response = await Permission.findById(pid);
  res.status(200).json({
    success: response ? true : false,
    permission: response ? response : "Đã xảy ra lỗi",
  });
});

// Cập nhật quyền (Update Permission)
const updatePermission = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const response = await Permission.findByIdAndUpdate(pid, req.body, {
    new: true,
  });
  res.status(200).json({
    success: response ? true : false,
    message: response ? "Cập nhật quyền thành công" : "Đã xảy ra lỗi",
  });
});

// Xóa quyền (Delete Permission)
const deletePermission = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const response = await Permission.findByIdAndDelete(pid);
  res.status(200).json({
    success: response ? true : false,
    message: response ? "Xóa quyền thành công" : "Đã xảy ra lỗi",
  });
});

module.exports = {
  createPermission,
  getAllPermissions,
  getPermissions,
  getPermission,
  updatePermission,
  deletePermission,
};
