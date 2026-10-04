import mongoose from "mongoose";

// _id is the Clerk user id (e.g. "user_2abc..."), so Clerk and MongoDB always point at the same person.
const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, default: "" },
    role: { type: String, enum: ["user", "hotelOwner"], default: "user" },
    recentSearchedCities: [{ type: String }],
  },
  { timestamps: true } // was "timeStamps" (wrong case), which Mongoose silently ignored
);

const User = mongoose.model("User", userSchema);

export default User;
