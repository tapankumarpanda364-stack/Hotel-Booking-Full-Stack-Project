import User from "../models/User.js";

// Clerk gives us the user in two shapes: snake_case in webhook payloads and
// camelCase from the backend SDK (clerkClient.users.getUser). This normalises both.
export const normalizeClerkUser = (u) => {
  const emails = u.email_addresses ?? u.emailAddresses ?? [];
  const primaryId = u.primary_email_address_id ?? u.primaryEmailAddressId;
  const primary = emails.find((e) => e.id === primaryId) ?? emails[0];
  const email = primary?.email_address ?? primary?.emailAddress ?? "";

  const first = u.first_name ?? u.firstName ?? "";
  const last = u.last_name ?? u.lastName ?? "";
  const fullName = `${first} ${last}`.trim();

  return {
    id: u.id,
    email,
    username: fullName || u.username || email.split("@")[0] || "Guest",
    image: u.image_url ?? u.imageUrl ?? "",
  };
};

// Create-or-update the MongoDB copy of a Clerk user. Never touches `role`,
// so a hotel owner stays a hotel owner when their profile is updated.
export const upsertUser = async (clerkUser) => {
  const { id, email, username, image } = normalizeClerkUser(clerkUser);
  const run = () =>
    User.findByIdAndUpdate(
      id,
      { $set: { username, email, image } },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

  try {
    return await run();
  } catch (error) {
    // The webhook and the first API call can try to create the same user at the same moment;
    // the loser gets a duplicate-key error. Retrying once simply updates the row the winner made.
    if (error.code === 11000) return run();
    throw error;
  }
};
