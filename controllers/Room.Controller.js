import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { Room } from "../models/room.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addHome = async (req, res) => {
  try {
    const {
      title,
      address,
      description,
      type,
      roomAvailable,
      bathrooms,
      rent,
      nearestCity,
      connectivity,
      phoneNumber,
      email,
      rentalTerms,
    } = req.body;

    // Ensure authenticated user is present
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const thumbnailFile = req.files?.thumbnail?.[0];
    const photosFiles = req.files?.photos || [];
    const videosFiles = req.files?.videos || [];

    if (
      !title ||
      !address ||
      !description ||
      !type ||
      !roomAvailable ||
      !bathrooms ||
      !rent ||
      !nearestCity ||
      !phoneNumber ||
      !rentalTerms ||
      !email ||
      !thumbnailFile
    ) {
      return res
        .status(400)
        .json({ message: "All required fields are required" });
    }

    // Upload thumbnail (required)
    const thumbnailURL = thumbnailFile
      ? await uploadOnCloudinary(thumbnailFile.path)
      : null;

    if (!thumbnailURL) {
      return res
        .status(400)
        .json({ message: "Thumbnail is required or upload failed" });
    }

    // Upload photos (optional, allow multiple)
    let photosURLs = [];
    if (photosFiles.length > 0) {
      const uploads = await Promise.all(
        photosFiles.map((f) => uploadOnCloudinary(f.path)),
      );
      photosURLs = uploads.filter(Boolean).map((u) => u.url);
    }

    // Upload videos (optional, allow multiple)
    let videosURLs = [];
    if (videosFiles.length > 0) {
      const uploads = await Promise.all(
        videosFiles.map((f) => uploadOnCloudinary(f.path)),
      );
      videosURLs = uploads.filter(Boolean).map((u) => u.url);
    }

    const newRoom = await Room.create({
      title,
      address,
      description,
      type,
      roomAvailable,
      bathrooms,
      rent,
      nearestCity,
      connectivity,
      phoneNumber,
      email,
      rentalTerms,
      thumbnail: thumbnailURL.url,
      photos: photosURLs,
      videos: videosURLs,
    });

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: { listing: newRoom._id },
      },
      { new: true },
    );

    return res
      .status(201)
      .json(new ApiResponse(201, newRoom, "Home added successfully"));
  } catch (error) {
    console.error("Error adding home:", error);
    return res.status(500).json({ message: "Failed to add home" });
  }
};

const GetRoom = async (req, res) => {
  try {
    const rooms = await Room.find();
    return res
      .status(200)
      .json(new ApiResponse(200, rooms, "Rooms fetched successfully"));
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
};

const GetRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    return res
      .status(200)
      .json(new ApiResponse(200, room, "Rooms detailed fatched"));
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ message: "Failed to fetch room" });
  }
};

export { addHome, GetRoom, GetRoomById };
