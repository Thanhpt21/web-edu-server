const express = require("express");
const router = express.Router();
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const {
  createPermission,
  getPermission,
  getPermissions,
  updatePermission,
  deletePermission,
  getAllPermissions,
} = require("../controllers/permission");

router.post("/", verifyAccessToken, isAdmin, createPermission);
router.get("/get", getAllPermissions);
router.get("/", getPermissions);
router.get("/:pid", getPermission);
router.put("/:pid", [verifyAccessToken, isAdmin], updatePermission);
router.delete("/:pid", [verifyAccessToken, isAdmin], deletePermission);

module.exports = router;
