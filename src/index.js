import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "../db/db_connect.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 5000;

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

// Start listening immediately. Database access is checked by the API middleware,
// so a MongoDB outage does not make the web service fail its port check.
server.listen(PORT, "0.0.0.0", () => {
  console.log(`RoomMate API is listening on port ${PORT}`);

  connectDB().catch((error) => {
    console.error("MongoDB is unavailable at startup:", error.message);
  });
});
