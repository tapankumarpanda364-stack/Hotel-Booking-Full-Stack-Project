// GET /api/user  -> who am I? (role decides whether the Dashboard link is shown)
export const getUserData = async (req, res) => {
  res.json({
    success: true,
    role: req.user.role,
    recentSearchedCities: req.user.recentSearchedCities,
  });
};

// POST /api/user/store-recent-search  { recentSearchedCity }
// Keeps the 3 most recent unique cities, newest last.
export const storeRecentSearchedCity = async (req, res) => {
  try {
    const city = String(req.body.recentSearchedCity ?? "").trim();
    if (!city) {
      return res.status(400).json({ success: false, message: "City is required" });
    }

    const cities = req.user.recentSearchedCities.filter((c) => c !== city);
    cities.push(city);
    req.user.recentSearchedCities = cities.slice(-3);
    await req.user.save();

    res.json({ success: true, recentSearchedCities: req.user.recentSearchedCities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
