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

    const thumbnail = req.files?.thumbnail?.[0]?.path;
    const photos = req.files?.photos?.[0]?.path;
    const videos = req.files?.videos?.[0]?.path;

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
      !thumbnail
    ) {
      return res
        .status(400)
        .json({ message: "All required fields are required" });
    }

    const thumbnailURL = await uploadOnCloudinary(thumbnail);
    const photoURL = photos ? await uploadOnCloudinary(photos) : null;
    const videoURL = videos ? await uploadOnCloudinary(videos) : null;

    if (!thumbnailURL) {
      return res.status(400).json({ message: "Failed to upload thumbnail" });
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
      photos: photoURL ? [photoURL.url] : [],
      videos: videoURL ? [videoURL.url] : [],
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
