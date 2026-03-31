import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "../db/db_connect.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// socket io setup
export const io = new Server(server, {
  cors: {
    origin: "https://roommate-frontend-69izgxcaq-anurag-choudharys-projects-c0129f03.vercel.app",
    credentials: true,
  },
});

const users = {};

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

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
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
  });


