import { Webhook } from "svix";
import User from "../models/User.js";
import { upsertUser } from "../utils/clerkUser.js";

// POST /api/clerk  - Clerk calls this when a user is created / updated / deleted,
// which keeps the MongoDB "users" collection in sync with Clerk.
// app.js gives us the RAW body (req.body is a Buffer) because the signature is computed over the exact bytes.
const clerkWebhooks = async (req, res) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return res
      .status(500)
      .json({ success: false, message: "CLERK_WEBHOOK_SECRET is not set on the server" });
  }

  // 1) Verify the request really came from Clerk
  let event;
  try {
    event = new Webhook(secret).verify(req.body.toString("utf8"), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });
  } catch {
    return res.status(400).json({ success: false, message: "Invalid webhook signature" });
  }

  // 2) Apply it. A failure here returns 500 so Clerk retries the delivery later.
  try {
    const { type, data } = event;
    switch (type) {
      case "user.created":
      case "user.updated":
        await upsertUser(data);
        break;
      case "user.deleted":
        if (data?.id) await User.findByIdAndDelete(data.id);
        break;
      default:
        break; // other event types are ignored
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Clerk webhook error:", error.message);
    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
};

export default clerkWebhooks;
