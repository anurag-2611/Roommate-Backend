import express from "express";
import { VerifyJwt } from "../middleware/Auth.middleware.js"
import {sendFriendRequest,acceptFriendRequest,rejectFriendRequest,getMyFriendData, removeFriend} from "../controllers/UserProfile.controller.js";

const UserProfileRouter = express.Router();

UserProfileRouter.post("/send-request/:receiverProfileId", VerifyJwt, sendFriendRequest);
UserProfileRouter.post("/accept-request/:senderProfileId", VerifyJwt, acceptFriendRequest);
UserProfileRouter.post("/reject-request/:senderProfileId", VerifyJwt, rejectFriendRequest);
UserProfileRouter.get("/my-friends-data", VerifyJwt, getMyFriendData);

UserProfileRouter.delete("/remove-friend/:friendId", VerifyJwt, removeFriend);

export { UserProfileRouter };