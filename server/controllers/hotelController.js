import Hotel from "../models/Hotel.js";

// POST /api/hotels  { name, address, contact, city }
// Registers the signed-in user's hotel and promotes them to "hotelOwner".
export const registerHotel = async (req, res) => {
  try {
    const { name, address, contact, city } = req.body;
    if (![name, address, contact, city].every((v) => typeof v === "string" && v.trim())) {
      return res
        .status(400)
        .json({ success: false, message: "Name, address, phone and city are all required" });
    }

    const existing = await Hotel.findOne({ owner: req.user._id });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "You have already registered a hotel" });
    }

    const hotel = await Hotel.create({
      name,
      address,
      contact,
      city,
      owner: req.user._id,
    });

    req.user.role = "hotelOwner";
    await req.user.save();

    res.status(201).json({ success: true, message: "Hotel registered successfully", hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
