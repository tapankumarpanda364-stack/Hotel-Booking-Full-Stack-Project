import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect, ownerOnly } from "../middleware/authMiddleware.js";
import {
  createRoom,
  getRooms,
  getOwnerRooms,
  getRoomById,
  toggleRoomAvailability,
} from "../controllers/roomController.js";

const roomRouter = express.Router();

roomRouter.get("/", getRooms);
roomRouter.get("/owner", protect, ownerOnly, getOwnerRooms); // must stay above "/:id"
roomRouter.get("/:id", getRoomById);
roomRouter.post("/", protect, ownerOnly, upload.array("images", 4), createRoom);
roomRouter.patch("/:id/availability", protect, ownerOnly, toggleRoomAvailability);

export default roomRouter;
