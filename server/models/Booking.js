import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: String, ref: "User", required: true, index: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    guests: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentMethod: { type: String, default: "Pay At Hotel" },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Speeds up the "is this room free for these dates?" lookup
bookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
