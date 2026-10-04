import express from "express";
import { protect, ownerOnly } from "../middleware/authMiddleware.js";
import {
  checkAvailability,
  createBooking,
  getUserBookings,
  getHotelBookings,
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkAvailability);
bookingRouter.post("/", protect, createBooking);
bookingRouter.get("/user", protect, getUserBookings);
bookingRouter.get("/hotel", protect, ownerOnly, getHotelBookings);

export default bookingRouter;
