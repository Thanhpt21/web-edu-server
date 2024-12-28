const express = require("express");
const router = express.Router();
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const uploader = require("../config/cloudinary.config");
const {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  ratings,
  uploadImageProduct,
  addVariant,
  removeVariant,
  updateVariant,
  getAllProducts,
  getProductsWithLatestRating,
  deleteRatingFromProduct,
  getAllRatingsByProduct,
} = require("../controllers/product");

router.get(
  "/latest-ratings",
  [verifyAccessToken, isAdmin],
  getProductsWithLatestRating
);
router.get(
  "/:pid/ratings",
  [verifyAccessToken, isAdmin],
  getAllRatingsByProduct
);
router.get("/getall", getAllProducts);
router.put("/ratings", verifyAccessToken, ratings);

router.put(
  "/uploadimage/:pid",
  [verifyAccessToken, isAdmin],
  uploader.array("images", 10),
  uploadImageProduct
);
router.post(
  "/",
  [verifyAccessToken, isAdmin],
  uploader.fields([
    {
      name: "images",
      maxCount: 10,
    },
    {
      name: "thumb",
      maxCount: 1,
    },
  ]),
  createProduct
);
router.put(
  "/:pid",
  [verifyAccessToken, isAdmin],
  uploader.fields([
    {
      name: "images",
      maxCount: 10,
    },
    {
      name: "thumb",
      maxCount: 1,
    },
  ]),
  updateProduct
);

router.put(
  "/variant/:pid",
  [verifyAccessToken, isAdmin],
  uploader.fields([
    {
      name: "images",
      maxCount: 10,
    },
    {
      name: "thumb",
      maxCount: 1,
    },
  ]),
  addVariant
);

router.put(
  "/variant/:pid/:sku",
  [verifyAccessToken, isAdmin],
  uploader.fields([
    {
      name: "images",
      maxCount: 10,
    },
    {
      name: "thumb",
      maxCount: 1,
    },
  ]),
  updateVariant
);

router.delete(
  "/:pid/rating/:ratingId",
  [verifyAccessToken, isAdmin],
  deleteRatingFromProduct
);

router.delete(
  "/variant/:pid/:sku",
  [verifyAccessToken, isAdmin],
  removeVariant
);
router.delete("/:pid", [verifyAccessToken, isAdmin], deleteProduct);

router.get("/:pid", getProduct);
router.get("/", getProducts);

module.exports = router;
