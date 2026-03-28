import { Router } from "express";
import { VerifyJwt } from "../middleware/Auth.middleware.js";
import { getMessages, sendMessage } from "../controllers/message.controller.js";

const msgRouter = Router();

msgRouter.get("/:friendId", VerifyJwt, getMessages);
msgRouter.post("/send", VerifyJwt, sendMessage);

export { msgRouter };