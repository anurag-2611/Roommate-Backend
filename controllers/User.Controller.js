import { User } from "../models/user.model.js";
import { UserProfile } from "../models/userProfile.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

const generateRefreshAndAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token",
    );
  }
};

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    /// check if all required fields are provided
    if (!firstName || !email || !password) {
      return res
        .status(201)
        .json(
          new ApiResponse(
            400,
            null,
            "First name, email and password are required.",
          ),
        );
      // throw new ApiError(400, "First name, email and password are required.");
    }

    /// check if the email is valid
    const existedUser = await User.findOne({ email });

    if (existedUser) {
      return res
        .status(201)
        .json(new ApiResponse(400, null, "Already registered"));
    }

    // create a new user
    const newUser = new User({ firstName, lastName, email, password });
    await newUser.save();

    return res
      .status(201)
      .json(new ApiResponse(200, newUser, "User registered Successfully"));
  } catch (error) {
    console.log(error.stack);
    throw new ApiError(500, "An error occurred while registering the user.");
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email and password are required"));
    }

    const existingUser = await User.findOne({ email });

    // user not found
    if (!existingUser) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    const passwordValid = await existingUser.isPasswordCorrect(password);

    if (!passwordValid) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Invalid credential"));
    }

    // yaha tak sab thik hai 👍

    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(
      existingUser._id,
    );

    const loggenInUser = await User.findById(existingUser._id).select(
      "-password -refreshToken",
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggenInUser,
            accessToken,
            refreshToken,
          },
          "Login successful",
        ),
      );
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

const logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { refreshToken: 1 },
    });

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        message: "Logged out successfully",
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    statusCode: 200,
    data: req.user,
    message: "Current user fetched successfully",
  });
};

const userProfile = async (req, res) => {
  try {
    // Debug: log incoming payload and files to aid troubleshooting
    console.log("[userProfile] incoming body:", {
      body: req.body,
      files: Object.keys(req.files || {}).reduce((acc, key) => {
        acc[key] = (req.files[key] || []).map((f) => ({
          originalname: f.originalname,
          path: f.path,
          size: f.size,
        }));
        return acc;
      }, {}),
    });

    const { userName, fullName, city, bio } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!userName || !fullName || !city || !bio) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "All fields are required"));
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // If user already has a profile, prevent duplicate creation
    if (user.userProfile) {
      return res
        .status(409)
        .json(new ApiResponse(409, null, "User profile already exists"));
    }

    const existingUserName = await UserProfile.findOne({ userName });
    if (existingUserName) {
      return res
        .status(409)
        .json(new ApiResponse(409, null, "Username already exists"));
    }

    const avatarPath = req.files?.avatar?.[0]?.path;

    if (!avatarPath) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Avatar image is required"));
    }

    const avatarURL = await uploadOnCloudinary(avatarPath);

    if (!avatarURL?.url) {
      return res
        .status(500)
        .json(new ApiResponse(500, null, "Upload avatar image failed"));
    }

    let newUserProfile;
    try {
      newUserProfile = await UserProfile.create({
        user: userId,
        userName,
        fullName,
        city,
        bio,
        avatar: avatarURL.url,
      });
    } catch (createErr) {
      // handle duplicate key (unique) errors clearly
      if (createErr && createErr.code === 11000) {
        return res
          .status(409)
          .json(
            new ApiResponse(409, null, "Username or profile already exists"),
          );
      }

      console.error("Error creating UserProfile:", createErr);
      return res
        .status(500)
        .json(new ApiResponse(500, null, "Failed to create user profile"));
    }

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          userProfile: newUserProfile._id,
        },
      },
      { new: true },
    );
    return res.status(201).json(
      new ApiResponse(
        201,
        {
          userProfile: newUserProfile,
          user,
        },
        "User profile created successfully",
      ),
    );
  } catch (error) {
    console.log("🔥 ERROR:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, error.message || "Server error"));
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("userProfile");

    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    if (!user.userProfile) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "User profile not created"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user.userProfile,
          "User profile fetched successfully",
        ),
      );
  } catch (error) {
    console.log("🔥 ERROR:", error);
    return res.status(500).json(new ApiResponse(500, null, "Server Error"));
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await UserProfile.find();

    return res
      .status(200)
      .json(new ApiResponse(200, users, "Users fetched successfully"));
  } catch (error) {
    console.log("🔥 ERROR:", error);
    return res.status(500).json(new ApiResponse(500, null, "Server Error"));
  }
};

const Addfavorites = async (req, res) => {
  try {
    const userId = req.user.id; // from auth
    const { roomId } = req.params;

    const user = await User.findById(userId);

    if (!user.favorites.includes(roomId)) {
      user.favorites.push(roomId);
      await user.save();
    }
    res.status(200).json({ message: "Added to favorites" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const Removefavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { roomId } = req.params;

    const user = await User.findById(userId);

    user.favorites = user.favorites.filter((fav) => fav.toString() !== roomId);

    await user.save();

    res.status(200).json({ message: "Removed from favorites" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const GetFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    res.json(
      new ApiResponse(
        201,
        { favorites: user.favorites.map((fav) => fav._id) },
        "fetched",
      ),
    );
  } catch (error) {
    res.status(500).json(new ApiResponse(200, null, "something went wrong"));
  }
};

const Favorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("favorites")
      .select("-password -refreshToken");

    res.json(new ApiResponse(201, user, "fetched"));
  } catch (error) {
    res.status(500).json(new ApiResponse(200, null, "something went wrong"));
  }
};

const getMyListings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("listing");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "My listings fetched successfully",
      data: user.listing,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch my listings",
      error: error.message,
    });
  }
};

export {
  registerUser,
  loginUser,
  userProfile,
  Addfavorites,
  Removefavorites,
  GetFavorites,
  Favorites,
  logoutUser,
  getCurrentUser,
  getUserProfile,
  getUsers,
  getMyListings,
};
