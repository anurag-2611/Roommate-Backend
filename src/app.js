import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// methods
import { Cityrouter } from "../routes/City.router.js";
import { Userrouter } from "../routes/User.router.js";
import { RoomRouter } from "../routes/Room.router.js";
import { UserProfileRouter } from "../routes/UserProfile.router.js";
import { msgRouter } from "../routes/message.router.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5000"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Example route
app.use("/api/city", Cityrouter);
app.use("/api/user", Userrouter);
app.use("/api/room", RoomRouter);
app.use("/api/friend", UserProfileRouter);
app.use("/api/message", msgRouter);

export default app;
