import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

const app = express();

// Frontend origin(s) allowed to call this API. Comma-separate to allow several.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((o) => o.trim());
app.use(cors({ origin: allowedOrigins }));

// Clerk webhook needs the RAW body to verify its signature, so it is registered BEFORE express.json()
app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

app.use(express.json());
app.use(clerkMiddleware()); // reads the Clerk session token on every request

app.get("/", (req, res) => res.send("API is working"));

app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);

// 404 for unknown routes
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// Central error handler (multer upload errors, bad JSON, anything unexpected)
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  let status = err.status || err.statusCode || 500;
  let message = err.message || "Something went wrong";

  if (err.name === "MulterError") {
    status = 400;
    if (err.code === "LIMIT_FILE_SIZE") message = "Each image must be 5 MB or smaller";
    if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE")
      message = "You can upload a maximum of 4 images";
  } else if (message === "Only image files are allowed") {
    status = 400;
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, message });
});

export default app;
