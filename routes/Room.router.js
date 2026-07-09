import { Router } from "express";
import { addHome, GetRoomById } from "../controllers/Room.Controller.js";
import { upload } from "../middleware/Multer.middleware.js";
import { GetRoom } from "../controllers/Room.Controller.js";
import { VerifyJwt } from "../middleware/Auth.middleware.js";

const RoomRouter = Router();

RoomRouter.route("/add-room").post(
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "photos",
      maxCount: 4,
    },
    {
      name: "videos",
      maxCount: 4,
    },
  ]),
  VerifyJwt,
  addHome,
);
RoomRouter.route("/get-rooms").get(GetRoom);

RoomRouter.route("/rooms/:id").get(GetRoomById);

export { RoomRouter };
