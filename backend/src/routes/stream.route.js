import express from "express";
import { StreamClient } from "@stream-io/node-sdk";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

const getStreamClient = () => {
  return new StreamClient(
    process.env.STREAM_API_KEY,
    process.env.STREAM_API_SECRET
  );
};

// GET /api/stream/token  — called by the frontend to get a user token
router.get("/token", protectRoute, (req, res) => {
  try {
    const client = getStreamClient();
    const userId = req.user._id.toString();

    const token = client.generateUserToken({ user_id: userId });

    res.json({
      token,
      apiKey: process.env.STREAM_API_KEY,
    });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    res.status(500).json({ message: "Failed to generate call token" });
  }
});

// POST /api/stream/call  — creates or retrieves a call room
router.post("/call", protectRoute, async (req, res) => {
  try {
    const client = getStreamClient();
    const { callId, receiverId } = req.body;
    const callerId = req.user._id.toString();

    const call = client.video.call("default", callId);

    await call.getOrCreate({
      data: {
        created_by_id: callerId,
        members: [
          { user_id: callerId },
          { user_id: receiverId },
        ],
      },
    });

    res.json({ callId, callType: "default" });
  } catch (error) {
    console.error("Error creating Stream call:", error);
    res.status(500).json({ message: "Failed to create call" });
  }
});

export default router;