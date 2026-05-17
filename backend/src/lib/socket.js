import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // send updated online users list to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ─── Video Call Events ─────────────────────────────────────────────────────

  // Caller → Receiver: incoming call notification
  socket.on("callInvite", ({ callId, callType, receiverId, callerName, callerPic }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingCall", {
        callId,
        callType,
        callerId: userId,
        callerName,
        callerPic,
      });
    }
  });

  // Receiver → Caller: call was accepted
  socket.on("callAccepted", ({ callId, callerId }) => {
    const callerSocketId = userSocketMap[callerId];
    if (callerSocketId) {
      io.to(callerSocketId).emit("callAccepted", { callId });
    }
  });

  // Either side → Other side: call was declined or ended
  socket.on("callDeclined", ({ callId, callerId }) => {
    const callerSocketId = userSocketMap[callerId];
    if (callerSocketId) {
      io.to(callerSocketId).emit("callDeclined", { callId });
    }
  });

  socket.on("callEnded", ({ callId, receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callEnded", { callId });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };