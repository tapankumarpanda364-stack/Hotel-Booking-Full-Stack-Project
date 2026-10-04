import { v2 as cloudinary } from "cloudinary";

// Uploads an in-memory image buffer (from multer) to Cloudinary and resolves with the secure URL.
export const uploadImageBuffer = (buffer, folder = "quickstay/rooms") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
