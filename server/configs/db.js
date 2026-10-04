import mongoose from "mongoose";

// Connects to MongoDB. Throws if it cannot, so server.js can stop with a clear message
// (the usual causes: wrong password in MONGODB_URI, or your IP is not allowed in Atlas -> Network Access).
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing. Add it to server/.env");
  }

  mongoose.connection.on("connected", () => console.log("Database Connected"));
  mongoose.connection.on("error", (err) => console.error("Database error:", err.message));
  mongoose.connection.on("disconnected", () => console.warn("Database disconnected"));

  // dbName is passed as an option (not glued onto the URI) so it works whether or not
  // the URI already has a path or ?query-string, e.g. Atlas "?retryWrites=true&w=majority".
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME || "quickstay",
    serverSelectionTimeoutMS: 10000,
  });
};

export default connectDB;
