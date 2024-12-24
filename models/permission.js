const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Đảm bảo tên permission là duy nhất
    },
    link: {
      type: String,
      required: true,
      unique: true, // Đảm bảo link permission là duy nhất
    },
  },
  {
    timestamps: true, // Tự động thêm trường createdAt và updatedAt
  }
);

// Export the model
module.exports = mongoose.model("Permission", permissionSchema);
