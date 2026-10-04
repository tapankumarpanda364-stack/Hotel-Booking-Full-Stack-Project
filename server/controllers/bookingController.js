import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { isObjectIdString, isRoomFree, parseStayDates } from "../utils/booking.js";

// POST /api/bookings/check-availability  (public)  { room, checkInDate, checkOutDate }
export const checkAvailability = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;
    if (!isObjectIdString(room)) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }
    const dates = parseStayDates(checkInDate, checkOutDate);
    if (dates.error) {
      return res.status(400).json({ success: false, message: dates.error });
    }

    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const isAvailable =
      roomDoc.isAvailable && (await isRoomFree(roomDoc._id, dates.checkIn, dates.checkOut));
    res.json({ success: true, isAvailable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/bookings  (signed in)  { room, checkInDate, checkOutDate, guests }
export const createBooking = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;
    const guests = Number(req.body.guests);

    if (!isObjectIdString(room)) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }
    if (!Number.isInteger(guests) || guests < 1) {
      return res.status(400).json({ success: false, message: "Please enter the number of guests" });
    }
    const dates = parseStayDates(checkInDate, checkOutDate);
    if (dates.error) {
      return res.status(400).json({ success: false, message: dates.error });
    }

    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }
    if (!roomDoc.isAvailable) {
      return res.status(409).json({ success: false, message: "This room is currently unavailable" });
    }
    if (!(await isRoomFree(roomDoc._id, dates.checkIn, dates.checkOut))) {
      return res
        .status(409)
        .json({ success: false, message: "Room is not available for the selected dates" });
    }

    const booking = await Booking.create({
      user: req.user._id,
      room: roomDoc._id,
      hotel: roomDoc.hotel,
      checkInDate: dates.checkIn,
      checkOutDate: dates.checkOut,
      guests,
      totalPrice: roomDoc.pricePerNight * dates.nights, // always computed server-side
    });

    res.status(201).json({ success: true, message: "Booking created successfully", booking });
  } catch (error) {
    console.error("createBooking error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/bookings/user  (signed in) - my bookings, newest first
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("room hotel")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/bookings/hotel  (owner) - dashboard numbers + bookings of the owner's hotel
export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.user._id });
    if (!hotel) {
      return res.status(404).json({ success: false, message: "No hotel found for this account" });
    }

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room hotel")
      .populate("user", "username email image")
      .sort({ createdAt: -1 });

    const active = bookings.filter((b) => b.status !== "cancelled");
    const totalRevenue = active.reduce((sum, b) => sum + b.totalPrice, 0);

    res.json({
      success: true,
      dashboardData: { totalBookings: active.length, totalRevenue, bookings },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
