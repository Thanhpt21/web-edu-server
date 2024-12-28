const Product = require("../models/product");
const Category = require("../models/category");
const Brand = require("../models/brand");
const Color = require("../models/color");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const makeSKU = require("uniqid");
const mongoose = require("mongoose");

const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    price,
    discount,
    description,
    brand,
    color,
    category,
    code,
    tags,
    size,
  } = req.body;
  const thumb = req?.files?.thumb[0]?.path;
  const images = req?.files?.images?.map((el) => el.path);
  if (!(title && price && discount && description && brand && color && code)) {
    throw new Error("Missing input");
  }
  req.body.slug = slugify(req.body.title);

  if (thumb) req.body.thumb = thumb;
  if (images) req.body.images = images;

  if (tags) {
    req.body.tags = tags.split(",").map((tag) => tag.trim());
  }

  if (size) {
    req.body.size = size.split(",").map((size) => size.trim());
  }

  const cat = await Category.findById(category);
  if (!cat) {
    return res.status(404).json({ message: "Category not found" });
  }

  const col = await Color.findById(color);
  if (!col) {
    return res.status(404).json({ message: "Color not found" });
  }

  const bra = await Brand.findById(brand);
  if (!bra) {
    return res.status(404).json({ message: "Brand not found" });
  }

  const response = await Product.create({ ...req.body, cat, col, bra });
  res.status(200).json({
    success: response ? true : false,
    message: response ? "Tạo sản phẩm thành công" : "Đã xảy ra lỗi",
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const response = await Product.findById(pid)
    .populate("category", "title images")
    .populate("color", "title code")
    .populate("brand", "title images")
    .populate({
      path: "ratings",
      populate: {
        path: "postedby",
        select: "firstname lastname avatar",
      },
    })
    .populate({
      path: "variants",
      populate: {
        path: "color", // Populate the color in variants
        select: "title",
      },
    });
  res.status(200).json({
    success: response ? true : false,
    productData: response ? response : "Đã xảy ra lỗi",
  });
});

const getProducts = asyncHandler(async (req, res) => {
  const queryObj = { ...req.query };
  const excludeFields = ["page", "sort", "limit", "fields"];
  excludeFields.forEach((el) => delete queryObj[el]);
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let formatedQueryObj = JSON.parse(queryStr);

  let formatQueries = {};

  if (queryObj?.title)
    formatedQueryObj.title = { $regex: queryObj.title, $options: "i" };

  if (req.query.q) {
    delete formatedQueryObj.q;
    formatedQueryObj["$or"] = [
      { title: { $regex: req.query.q, $options: "i" } },
    ];
  }

  if (queryObj?.category) {
    if (mongoose.isValidObjectId(queryObj.category)) {
      // Nếu category là ID hợp lệ, sử dụng ObjectId
      formatedQueryObj.category = mongoose.Types.ObjectId(queryObj.category);
    } else {
      formatedQueryObj.category = { $regex: queryObj.category };
    }
  }
  if (queryObj?.color) {
    // Chia các ID màu ra và chuyển chúng thành ObjectId
    const colorIds = queryObj.color
      .split(",")
      .map((id) => id.trim()) // Xóa khoảng trắng thừa
      .filter((id) => mongoose.isValidObjectId(id)) // Chỉ giữ lại các ID hợp lệ
      .map((id) => mongoose.Types.ObjectId(id)); // Chuyển đổi thành ObjectId

    if (colorIds.length > 0) {
      formatedQueryObj.color = { $in: colorIds };
    } else {
      // Nếu không có ID hợp lệ, có thể xử lý tùy theo yêu cầu (nếu cần)
      delete formatedQueryObj.color; // Xóa nếu không có ID hợp lệ
    }
  }

  if (queryObj?.brand) {
    // Chia các ID màu ra và chuyển chúng thành ObjectId
    const brandIds = queryObj.brand
      .split(",")
      .map((id) => id.trim()) // Xóa khoảng trắng thừa
      .filter((id) => mongoose.isValidObjectId(id)) // Chỉ giữ lại các ID hợp lệ
      .map((id) => mongoose.Types.ObjectId(id)); // Chuyển đổi thành ObjectId

    if (brandIds.length > 0) {
      formatedQueryObj.brand = { $in: brandIds };
    } else {
      // Nếu không có ID hợp lệ, có thể xử lý tùy theo yêu cầu (nếu cần)
      delete formatedQueryObj.brand; // Xóa nếu không có ID hợp lệ
    }
  }

  if (queryObj?.q) {
    delete formatedQueryObj.q;
    formatedQueryObj["$or"] = [
      { title: { $regex: queryObj.q, $options: "i" } },
      // { color: { $regex: queryObj.q, $options: "i" } },
    ];
  }

  const sanitizeQuery = (query) => {
    const sanitized = { ...query };
    for (const key in sanitized) {
      if (
        sanitized[key] &&
        typeof sanitized[key] === "object" &&
        sanitized[key].$options
      ) {
        sanitized[key] = {
          $regex: sanitized[key].$regex,
          $options: sanitized[key].$options,
        };
      }
    }
    return sanitized;
  };

  let sanitizedQueryObj = sanitizeQuery(formatedQueryObj);

  let q = { ...formatQueries, ...sanitizedQueryObj };
  let query = Product.find(q)
    .populate("color", "title code")
    .populate("category", "title images")
    .populate("brand", "title images")
    .populate({
      path: "variants",
      populate: {
        path: "color", // Populate the color in variants
        select: "title",
      },
    });
  //sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }
  //limiting the fields
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
    const counts = await Product.find(q).countDocuments();
    res.status(200).json({
      success: response ? true : false,
      products: response ? response : "Đã xảy ra lỗi",
      counts,
    });
  });
});

const getAllProducts = asyncHandler(async (req, res) => {
  const response = await Product.find()
    .populate("color", "title code")
    .populate("category", "title images")
    .populate("brand", "title images")
    .populate({
      path: "variants",
      populate: {
        path: "color", // Populate the color in variants
        select: "title",
      },
    });
  res.status(200).json({
    success: response ? true : false,
    products: response ? response : "Đã xảy ra lỗi",
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const files = req?.files;

  if (files?.thumb) {
    req.body.thumb = files?.thumb[0]?.path;
  }
  if (files?.images) {
    req.body.images = files?.images?.map((el) => el.path);
  }

  if (req.body.tags) {
    req.body.tags = req.body.tags.split(",").map((tag) => tag.trim());
  }

  if (req.body.size) {
    if (typeof req.body.size === "string") {
      req.body.size = req.body.size.split(",").map((s) => s.trim());
    }
  }

  if (req.body && req.body.title) {
    req.body.slug = slugify(req.body.title);
  }

  const response = await Product.findByIdAndUpdate(pid, req.body, {
    new: true,
  });
  res.status(200).json({
    success: response ? true : false,
    message: response ? "Cập nhật thành công" : "Đã xảy ra lỗi",
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const response = await Product.findByIdAndDelete(pid);
  res.status(200).json({
    success: response ? true : false,
    message: response ? "Xóa thành công" : "Đã xảy ra lỗi",
  });
});

const ratings = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { pid, star, comment, updatedAt } = req.body;
  if (!star || !pid) throw new Error("Missing input");
  const product = await Product.findById(pid);
  const alreadyRated = product?.ratings?.some(
    (el) => el.postedby.toString() === _id
  );

  if (alreadyRated) {
    await Product.updateOne(
      {
        ratings: { $elemMatch: { alreadyRated } },
      },
      {
        $set: {
          "ratings.$.star": star,
          "ratings.$.comment": comment,
          "ratings.$.updatedAt": updatedAt,
        },
      },
      {
        new: true,
      }
    );
  } else {
    await Product.findByIdAndUpdate(
      pid,
      {
        $push: { ratings: { star, comment, postedby: _id, updatedAt } },
      },
      { new: true }
    );
  }
  const updatedProduct = await Product.findById(pid);
  let totalRatings = updatedProduct.ratings.length;
  let ratingsum = updatedProduct.ratings.reduce((sum, el) => sum + el.star, 0);
  updatedProduct.totalratings =
    Math.round((ratingsum * 10) / totalRatings) / 10;

  await updatedProduct.save();

  return res.status(200).json({
    status: true,
    updatedProduct,
  });
});

const uploadImageProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  if (!req.files) throw new "Missing input"();
  const response = await Product.findByIdAndUpdate(
    pid,
    {
      $push: { images: { $each: req.files.map((el) => el.path) } },
    },
    { new: true }
  );
  return res.status(200).json({
    success: response ? true : false,
    updatedProduct: response ? response : "Đã xảy ra lỗi",
  });
});

const addVariant = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const { title, price, color, discount } = req.body;
  const thumb = req?.files?.thumb[0]?.path;
  const images = req?.files?.images?.map((el) => el.path);

  if (!(title && price && color && discount)) {
    throw new Error("Missing input");
  }
  const col = await Color.findById(color);
  if (!col) {
    return res.status(404).json({ message: "Color not found" });
  }

  req.body.slug = slugify(req.body.title);

  const response = await Product.findByIdAndUpdate(
    pid,
    {
      $push: {
        variants: {
          color,
          price,
          discount,
          title,
          thumb,
          images,
          sku: makeSKU().toUpperCase(),
        },
      },
    },
    { new: true }
  );
  return res.status(200).json({
    success: response ? true : false,
    response: response ? "Thêm thành công" : "Đã xảy ra lỗi",
  });
});

const updateVariant = asyncHandler(async (req, res) => {
  const { pid, sku } = req.params;
  const { title, price, color, discount, thumb, images } = req.body;

  if (thumb) {
    req.body.thumb = thumb;
  }
  if (images) {
    req.body.images = images.map((el) => el);
  }

  // Kiểm tra các trường bắt buộc
  if (!(title && price && color && discount)) {
    return res.status(400).json({ message: "Missing input" });
  }

  // Kiểm tra sự tồn tại của màu sắc
  const col = await Color.findById(color);
  if (!col) {
    return res.status(404).json({ message: "Color not found" });
  }

  // Tạo slug từ tiêu đề
  req.body.slug = slugify(req.body.title);

  // Cập nhật sản phẩm
  const response = await Product.findOneAndUpdate(
    { _id: pid, "variants.sku": sku },
    {
      $set: {
        "variants.$.title": title,
        "variants.$.price": price,
        "variants.$.discount": discount,
        "variants.$.color": color,
        "variants.$.thumb": thumb,
        "variants.$.images": images,
        "variants.$.sku": makeSKU().toUpperCase(),
      },
    },
    { new: true }
  );
  return res.status(200).json({
    success: response ? true : false,
    message: response ? "Cập nhật thành công" : "Đã xảy ra lỗi",
  });
});

const removeVariant = asyncHandler(async (req, res) => {
  const { pid, sku } = req.params;
  const response = await Product.findByIdAndUpdate(
    pid,
    {
      $pull: {
        variants: {
          sku: sku,
        },
      },
    },
    { new: true }
  );
  return res.status(200).json({
    success: response ? true : false,
    response: response ? "Xóa thành công" : "Đã xảy ra lỗi",
  });
});

const getProductsWithLatestRating = asyncHandler(async (req, res) => {
  // Tìm tất cả sản phẩm có ít nhất một đánh giá và sắp xếp theo ngày đánh giá mới nhất
  const response = await Product.aggregate([
    {
      $match: {
        ratings: { $ne: [] }, // Lọc các sản phẩm có ít nhất một đánh giá
      },
    },
    {
      $project: {
        title: 1,
        ratings: 1,
        category: 1,
        color: 1,
        brand: 1,
        price: 1,
        discount: 1,
        thumb: 1,
        totalratings: 1,
        createdAt: 1,
      },
    },
    {
      $unwind: "$ratings", // Tháo rời mảng ratings để dễ sắp xếp và populate
    },
    {
      $sort: {
        "ratings.updatedAt": -1, // Sắp xếp các đánh giá theo thời gian cập nhật
      },
    },
    {
      $lookup: {
        from: "users", // Tên bảng Users trong MongoDB
        localField: "ratings.postedby", // Trường `postedby` trong mảng ratings
        foreignField: "_id", // Trường `_id` trong bảng Users
        as: "ratings.user", // Kết quả của populate sẽ được lưu vào trường `ratings.user`
      },
    },
    {
      $unwind: "$ratings.user", // Giải nén kết quả populate ra từng đối tượng người dùng
    },
    {
      $project: {
        title: 1,
        ratings: {
          _id: 1,
          star: 1,
          comment: 1,
          updatedAt: 1,
          postedby: 1,
          user: { email: 1 }, // Chỉ lấy trường `email` của user
        },
        category: 1,
        color: 1,
        brand: 1,
        price: 1,
        discount: 1,
        thumb: 1,
        totalratings: 1,
        createdAt: 1,
      },
    },
    {
      $group: {
        _id: "$_id",
        title: { $first: "$title" },
        ratings: { $push: "$ratings" }, // Lưu tất cả các đánh giá vào mảng
        category: { $first: "$category" },
        color: { $first: "$color" },
        brand: { $first: "$brand" },
        price: { $first: "$price" },
        discount: { $first: "$discount" },
        thumb: { $first: "$thumb" },
        totalratings: { $first: "$totalratings" },
        createdAt: { $first: "$createdAt" },
      },
    },
    {
      $sort: {
        "ratings.updatedAt": -1, // Sắp xếp lại theo thời gian cập nhật đánh giá mới nhất
      },
    },
    {
      $limit: 10, // Giới hạn số lượng sản phẩm hiển thị
    },
  ]);

  res.status(200).json({
    success: response ? true : false,
    products: response || "Đã xảy ra lỗi",
  });
});

const deleteRatingFromProduct = asyncHandler(async (req, res) => {
  const { pid, ratingId } = req.params; // Lấy ID sản phẩm và ID đánh giá từ params

  // Tìm sản phẩm và xóa đánh giá trong mảng ratings
  const updatedProduct = await Product.findOneAndUpdate(
    { _id: pid, "ratings._id": ratingId }, // Tìm sản phẩm có chứa đánh giá này
    {
      $pull: { ratings: { _id: ratingId } }, // Xóa đánh giá dựa trên _id của đánh giá
    },
    { new: true } // Trả về sản phẩm đã được cập nhật
  );

  if (!updatedProduct) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy sản phẩm hoặc đánh giá.",
    });
  }

  // Tính lại totalratings sau khi xóa một đánh giá
  let totalratings = 0;
  if (updatedProduct.ratings.length > 0) {
    // Nếu còn đánh giá, tính trung bình các sao
    totalratings =
      updatedProduct.ratings.reduce((sum, rating) => sum + rating.star, 0) /
      updatedProduct.ratings.length;
  }

  // Cập nhật lại totalratings của sản phẩm
  updatedProduct.totalratings = totalratings;

  // Lưu sản phẩm đã được cập nhật
  await updatedProduct.save();

  res.status(200).json({
    success: true,
    message:
      "Đánh giá đã được xóa thành công và tổng đánh giá đã được cập nhật.",
    products: updatedProduct, // Trả về sản phẩm đã được cập nhật
  });
});

const getAllRatingsByProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params; // Lấy productId từ params của URL

  if (!pid) {
    return res
      .status(400)
      .json({ success: false, message: "Product ID is required" });
  }

  try {
    // Tìm sản phẩm theo productId và lấy tất cả đánh giá
    const product = await Product.findById(pid)
      .select("ratings")
      .populate("ratings.postedby", "email");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Trả về tất cả đánh giá của sản phẩm
    return res.status(200).json({
      success: true,
      ratings: product.ratings, // Chỉ trả về mảng ratings của sản phẩm
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  getAllProducts,
  updateProduct,
  deleteProduct,
  ratings,
  uploadImageProduct,
  addVariant,
  updateVariant,
  removeVariant,
  getProductsWithLatestRating,
  deleteRatingFromProduct,
  getAllRatingsByProduct,
};
