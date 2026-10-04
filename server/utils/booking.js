import Booking from "../models/Booking.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// Parses and validates a check-in / check-out pair (strings like "2026-10-05").
// Returns { checkIn, checkOut, nights } or { error }.
export const parseStayDates = (checkInDate, checkOutDate) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    return { error: "Please provide valid check-in and check-out dates" };
  }
  if (checkOut <= checkIn) {
    return { error: "Check-out date must be after the check-in date" };
  }

  // Allow one day of slack so users in time zones behind UTC can still book "today"
  const startOfTodayUtc = new Date();
  startOfTodayUtc.setUTCHours(0, 0, 0, 0);
  if (checkIn.getTime() < startOfTodayUtc.getTime() - DAY_MS) {
    return { error: "Check-in date cannot be in the past" };
  }

  const nights = Math.ceil((checkOut - checkIn) / DAY_MS);
  return { checkIn, checkOut, nights };
};

// A room is free if no non-cancelled booking overlaps [checkIn, checkOut).
// Same-day turnover is allowed: someone checking out on the 5th doesn't block a check-in on the 5th.
export const isRoomFree = async (roomId, checkIn, checkOut) => {
  const clash = await Booking.exists({
    room: roomId,
    status: { $ne: "cancelled" },
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn },
  });
  return !clash;
};

export const isObjectIdString = (value) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
