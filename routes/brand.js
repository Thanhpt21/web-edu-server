const express = require("express");
const router = express.Router();
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const uploader = require("../config/cloudinary.config");
const {
  createBrand,
  getBrand,
  getBrands,
  getAllBrands,
  updateBrand,
  deleteBrand,
} = require("../controllers/brand");

router.post(
  "/",
  [verifyAccessToken, isAdmin],
  uploader.single("images"),
  createBrand
);
router.put(
  "/:bid",
  [verifyAccessToken, isAdmin],
  uploader.single("images"),
  updateBrand
);
router.delete("/:bid", [verifyAccessToken, isAdmin], deleteBrand);

router.get("/get", getAllBrands);
router.get("/", getBrands);
router.get("/:bid", getBrand);

module.exports = router;
