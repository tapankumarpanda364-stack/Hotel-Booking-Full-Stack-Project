import "dotenv/config";
import app from "./app.js";
import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(); // wait for MongoDB first so no request ever hits a dead database
    connectCloudinary();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (error) {
    console.error("Could not start the server:", error.message);
    process.exit(1);
  }
};

start();
