import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "do0kslzvl",
  api_key: "917275788864446",
  api_secret: "A7Mtohd4pzNtg9CpkDYEYw_Xs7Y",
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "roommate",
    });

    // delete the local file after upload
    fs.unlinkSync(localFilePath);
    return response;

  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.error("Error uploading to Cloudinary:");
  }
};


export { uploadOnCloudinary };
