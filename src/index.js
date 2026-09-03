import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "../db/db_connect.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URL) {
  console.error("Startup failed: MONGO_URL environment variable is not configured.");
  process.exit(1);
}

const allowedOrigins = [
  "http://localhost:5173",
  "https://roommate-henna.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

const server = http.createServer(app);

// socket io setup
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const users = {};

io.on("connection", (socket) => {
  // join
  socket.on("join", (userId) => {
    users[userId] = socket.id;
  });

  // send message
  socket.on("send_message", (data) => {
    const receiverSocket = users[data.receiverId];

    if (receiverSocket) {
      io.to(receiverSocket).emit("receive_message", data);
    }
  });

  // disconnect
  socket.on("disconnect", () => {
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
      }
    }
  });
});

// db connect ke baad server start karo
connectDB()
  .then(() => {
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`RoomMate API is listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
