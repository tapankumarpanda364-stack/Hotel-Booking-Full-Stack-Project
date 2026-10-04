import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "../utils/api";

// Every request goes to the Express server (client/.env -> VITE_BACKEND_URL)
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [isOwner, setIsOwner] = useState(false);
  const [authReady, setAuthReady] = useState(false); // true once we know whether the user is an owner
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setSearchedCities] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Headers for endpoints that need a signed-in user (Clerk session token)
  const authHeaders = useCallback(async () => {
    const token = await getToken();
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [getToken]);

  const fetchRooms = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/rooms");
      if (data.success) setRooms(data.rooms);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/user", await authHeaders());
      if (data.success) {
        setIsOwner(data.role === "hotelOwner");
        setSearchedCities(data.recentSearchedCities);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Re-check the role whenever the signed-in user changes (login / logout)
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setIsOwner(false);
      setSearchedCities([]);
      setAuthReady(true);
      return;
    }
    fetchUser().finally(() => setAuthReady(true));
  }, [isLoaded, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    axios,
    navigate,
    user,
    authHeaders,
    isOwner,
    setIsOwner,
    authReady,
    showHotelReg,
    setShowHotelReg,
    searchedCities,
    setSearchedCities,
    rooms,
    setRooms,
    fetchRooms,
    fetchUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
