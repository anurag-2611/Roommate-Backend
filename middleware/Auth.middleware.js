
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const VerifyJwt = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    const token =req.cookies?.accessToken || authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Access Token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("VerifyJwt error:", error.message);
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export { VerifyJwt };