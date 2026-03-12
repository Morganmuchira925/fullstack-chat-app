import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";  // Add this import

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

// Get the directory name properly with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend folder (parent directory)
dotenv.config({ path: path.join(__dirname, "../.env") });

// Add fallback for PORT
const PORT = process.env.PORT || 5001;

// Debug: Check if environment variables are loaded
console.log("Environment check:");
console.log("- PORT:", process.env.PORT || "Using fallback 5001");
console.log("- MONGODB_URI:", process.env.MONGODB_URI ? "Set ✓" : "Not set ❌");

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));  // Fixed path
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));  // Fixed path
  });
}

// Connect to MongoDB first, then start server
const startServer = async () => {
  try {
    await connectDB();  // Connect to database first
    server.listen(PORT, () => {
      console.log("Server is running on PORT: " + PORT);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();