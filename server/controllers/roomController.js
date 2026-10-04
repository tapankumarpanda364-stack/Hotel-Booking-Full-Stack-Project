import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { isCloudinaryConfigured } from "../configs/cloudinary.js";
import { uploadImageBuffer } from "../utils/uploadToCloudinary.js";
import { isObjectIdString } from "../utils/booking.js";

const ROOM_TYPES = ["Single Bed", "Double Bed", "Luxury Room", "Family Suites"];
const AMENITIES = ["Free WiFi", "Free Breakfast", "Room Service", "Mountain View", "Pool Access"];

const hotelPopulate = {
  path: "hotel",
  populate: { path: "owner", select: "username image" },
};

// POST /api/rooms  (owner)  multipart/form-data: images[] (1-4), roomType, pricePerNight, amenities (JSON array)
export const createRoom = async (req, res) => {
  try {
    const { roomType, pricePerNight } = req.body;
    const price = Number(pricePerNight);

    let amenities = [];
    try {
      amenities = JSON.parse(req.body.amenities || "[]");
    } catch {
      return res.status(400).json({ success: false, message: "Amenities must be a JSON array" });
    }

    if (!ROOM_TYPES.includes(roomType)) {
      return res.status(400).json({ success: false, message: "Please choose a valid room type" });
    }
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ success: false, message: "Price per night must be greater than 0" });
    }
    if (!Array.isArray(amenities) || amenities.some((a) => !AMENITIES.includes(a))) {
      return res.status(400).json({ success: false, message: "Invalid amenities selected" });
    }
    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: "Please upload at least one image" });
    }
    if (!isCloudinaryConfigured()) {
      return res.status(500).json({
        success: false,
        message: "Image upload is not configured. Add the CLOUDINARY_* keys to server/.env",
      });
    }

    const hotel = await Hotel.findOne({ owner: req.user._id });
    if (!hotel) {
      return res.status(404).json({ success: false, message: "No hotel found for this account" });
    }

    const images = await Promise.all(req.files.map((file) => uploadImageBuffer(file.buffer)));

    const room = await Room.create({
      hotel: hotel._id,
      roomType,
      pricePerNight: price,
      amenities,
      images,
    });

    res.status(201).json({ success: true, message: "Room created successfully", room });
  } catch (error) {
    console.error("createRoom error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/rooms  (public) - every room that is currently available, newest first
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true })
      .populate(hotelPopulate)
      .sort({ createdAt: -1 });
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/rooms/owner  (owner) - rooms of the signed-in owner's hotel
export const getOwnerRooms = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.user._id });
    if (!hotel) {
      return res.status(404).json({ success: false, message: "No hotel found for this account" });
    }
    const rooms = await Room.find({ hotel: hotel._id })
      .populate("hotel")
      .sort({ createdAt: -1 });
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/rooms/:id  (public) - one room (also returned if switched off, so the page can say so)
export const getRoomById = async (req, res) => {
  try {
    if (!isObjectIdString(req.params.id)) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }
    const room = await Room.findById(req.params.id).populate(hotelPopulate);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }
    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/rooms/:id/availability  (owner) - flips isAvailable on one of the owner's rooms
export const toggleRoomAvailability = async (req, res) => {
  try {
    if (!isObjectIdString(req.params.id)) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }
    const hotel = await Hotel.findOne({ owner: req.user._id });
    const room = hotel && (await Room.findOne({ _id: req.params.id, hotel: hotel._id }));
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }
    room.isAvailable = !room.isAvailable;
    await room.save();
    res.json({ success: true, message: "Room availability updated", room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
