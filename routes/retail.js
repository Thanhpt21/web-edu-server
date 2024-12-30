const express = require("express");
const router = express.Router();
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const uploader = require("../config/cloudinary.config");
const {
  createRetail,
  getRetails,
  updateRetail,
  deleteRetail,
  getAllRetails,
} = require("../controllers/retail");

router.post(
  "/",
  verifyAccessToken,
  isAdmin,
  uploader.single("images"),
  createRetail
);
router.get("/getall", getAllRetails);
router.get("/", getRetails);
router.put(
  "/:rid",
  [verifyAccessToken, isAdmin],
  uploader.single("images"),
  updateRetail
);
router.delete("/:rid", [verifyAccessToken, isAdmin], deleteRetail);

module.exports = router;
