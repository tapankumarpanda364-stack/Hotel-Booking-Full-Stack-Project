import { getAuth, clerkClient } from "@clerk/express";
import User from "../models/User.js";
import { upsertUser } from "../utils/clerkUser.js";

// Requires a signed-in user (Clerk session token sent as "Authorization: Bearer <token>").
// Loads the matching MongoDB user into req.user. If the Clerk webhook hasn't created that
// user yet (or isn't configured locally), the user is created on the fly from Clerk.
export const protect = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    let user = await User.findById(userId);
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);
      user = await upsertUser(clerkUser);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

// Use after `protect`: only users who registered a hotel may continue.
export const ownerOnly = (req, res, next) => {
  if (req.user?.role !== "hotelOwner") {
    return res
      .status(403)
      .json({ success: false, message: "Only hotel owners can do this" });
  }
  next();
};
