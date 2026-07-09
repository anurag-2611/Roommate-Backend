import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "do0kslzvl",
  api_key: process.env.CLOUDINARY_API_KEY || "917275788864446",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "A7Mtohd4pzNtg9CpkDYEYw_Xs7Y",
});

const safeUnlink = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {
    console.warn("Failed to remove local file:", filePath, e.message);
  }
};

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "roommate",
    });

    // delete the local file after upload
    safeUnlink(localFilePath);
    return response;
  } catch (error) {
    safeUnlink(localFilePath);
    console.error(
      "Error uploading to Cloudinary:",
      error && error.message ? error.message : error,
    );
    return null;
  }
};

export { uploadOnCloudinary };
