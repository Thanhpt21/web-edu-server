const express = require("express");
const multer = require("multer");
const { uploadImage, uploadImages } = require("../controllers/upload");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint để upload một file
router.post("/image", upload.single("file"), async (req, res) => {
  try {
    const result = await uploadImage(req.file);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint để upload nhiều file
router.post("/images", upload.array("files"), async (req, res) => {
  try {
    const result = await uploadImages(req.files);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
