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
    origin: ["https://roommate-frontend-69izgxcaq-anurag-choudharys-projects-c0129f03.vercel.app", "https://roommate-backend-bh0y1q6g1-anurag-choudharys-projects-c0129f03.vercel.app/"],
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
