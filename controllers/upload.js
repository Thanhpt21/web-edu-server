const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Helper function to convert buffer to readable stream
const bufferToStream = (buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

// Upload một file
const uploadImage = async (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({ secure_url: result.secure_url });
        }
      }
    );
    bufferToStream(file.buffer).pipe(uploadStream);
  });
};

// Upload nhiều file
const uploadImages = async (files) => {
  const uploadPromises = files.map(
    (file) =>
      new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        bufferToStream(file.buffer).pipe(uploadStream);
      })
  );

  const urls = await Promise.all(uploadPromises);
  return { data: urls };
};

module.exports = { uploadImage, uploadImages };
