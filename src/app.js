import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "../db/db_connect.js";

// methods
import { Cityrouter } from "../routes/City.router.js";
import { Userrouter } from "../routes/User.router.js";
import { RoomRouter } from "../routes/Room.router.js";
import { UserProfileRouter } from "../routes/UserProfile.router.js";
import { msgRouter } from "../routes/message.router.js";

dotenv.config();

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://roommate-henna.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/health", async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({ success: true, message: "RoomMate API is healthy" });
  } catch {
    res.status(503).json({
      success: false,
      message: "Database connection is unavailable",
    });
  }
});

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch {
    res.status(503).json({
      success: false,
      message: "Database connection is unavailable",
    });
  }
});

// Example route
app.use("/api/city", Cityrouter);
app.use("/api/user", Userrouter);
app.use("/api/room", RoomRouter);
app.use("/api/friend", UserProfileRouter);
app.use("/api/message", msgRouter);

app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export default app;
