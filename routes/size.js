const express = require("express");
const router = express.Router();
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const {
  createSize,
  getSize,
  getSizes,
  updateSize,
  deleteSize,
  getAllSizes,
} = require("../controllers/size");

router.post("/", verifyAccessToken, isAdmin, createSize);

router.get("/", getSizes);
router.get("/getall", getAllSizes);
router.get("/:sid", getSize);

router.put("/:sid", [verifyAccessToken, isAdmin], updateSize);
router.delete("/:sid", [verifyAccessToken, isAdmin], deleteSize);

module.exports = router;
