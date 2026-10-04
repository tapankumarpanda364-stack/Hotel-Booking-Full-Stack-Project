import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useClerk } from "@clerk/react";
import { toast } from "react-hot-toast";
import {
  assets,
  facilityIcons,
  roomCommonData,
} from "../assets/assets";
import StarRating from "../components/StarRating";
import { useAppContext } from "../context/AppContext";
import { getErrorMessage } from "../utils/api";

const RoomDetails = () => {
  const { id } = useParams();
  const { axios, user, authHeaders, navigate } = useAppContext();
  const { openSignIn } = useClerk();

  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in the user's local time

  // Load this room from the backend
  useEffect(() => {
    const loadRoom = async () => {
      try {
        const { data } = await axios.get(`/api/rooms/${id}`);
        if (data.success) {
          setRoom(data.room);
          setMainImage(data.room.images[0]);
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    };
    loadRoom();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAvailability = async () => {
    if (checkInDate >= checkOutDate) {
      toast.error("Check-out date must be after the check-in date");
      return;
    }
    const { data } = await axios.post("/api/bookings/check-availability", {
      room: id,
      checkInDate,
      checkOutDate,
    });
    if (data.success && data.isAvailable) {
      setIsAvailable(true);
      toast.success("Room is available for these dates");
    } else {
      setIsAvailable(false);
      toast.error(data.message || "Room is not available for these dates");
    }
  };

  // First click checks availability, second click ("Book Now") creates the booking
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isAvailable) {
        await checkAvailability();
        return;
      }
      if (!user) {
        openSignIn();
        return;
      }
      const { data } = await axios.post(
        "/api/bookings",
        { room: id, checkInDate, checkOutDate, guests },
        await authHeaders()
      );
      if (data.success) {
        toast.success(data.message);
        navigate("/my-bookings");
        scrollTo(0, 0);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    room && (
      <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
        {/* Rooms Details */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <h1 className="text-3xl md:text-4xl font-playfair">
            {room.hotel.name}
            <span className="font-inter text-sm">({room.roomType})</span>
          </h1>
          <p
            className="text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full
        "
          >
            20% OFF
          </p>
        </div>
        {/* Room rating */}
        <div className="flex items-center gap-1 mt-2">
          <StarRating />
          <p className="ml-2">200+ reviews</p>
        </div>

        {/* Room address */}

        <div className="flex items-center gap-1 text-gray-500 mt-2">
          <img src={assets.locationIcon} alt="location-icon" />
          <span>{room.hotel.address}</span>
        </div>

        {/* Room Images */}

        <div className="flex flex-col lg:flex-row mt-6 gap-6">
          <div className="lg:w-1/2 w-full">
            <img
              src={mainImage}
              alt="Room Image"
              className="w-full rounded-xl 
            shadow-lg object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">
            {room?.images.length > 1 &&
              room.images.map((image, index) => (
                <img
                  onClick={() => setMainImage(image)}
                  key={index}
                  src={image}
                  alt="Room Image"
                  className={`w-full rounded-xl shadow-md object-cover cursor-pointer 
                    ${mainImage === image && "outline-3 outline-orange-500"}`}
                />
              ))}
          </div>
        </div>
        {/* room highlight */}

        <div className="flex flex-col md:flex-row md:justify-between mt-10">
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-playfair">
              Experience Luxury Like Never Before{" "}
            </h1>
            <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">
              {room.amenities.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2
                    rounded-lg bg-gray-100"
                >
                  <img
                    src={facilityIcons[item]}
                    alt={item}
                    className="w-5 h-5"
                  />
                  <p className="text-xs">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-2xl font-medium">${room.pricePerNight}/night</p>
        </div>

        {/* check in check out */}

        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col md:flex-row items-start md:items-center justify-between
      bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl
       mx-auto mt-16 max-w-6xl"
        >
          <div
            className="flex flex-col flex-wrap md:flex-row items-start
         md:items-center gap-4 md:gap-10 text-gray-500"
          >
            <div className="flex flex-col">
              <label htmlFor="checkInDate" className="font-medium">
                Check-In
              </label>
              <input
                type="date"
                id="checkInDate"
                placeholder="Check-In"
                value={checkInDate}
                min={today}
                onChange={(e) => { setCheckInDate(e.target.value); setIsAvailable(false); }}
                className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 
            outline-none"
                required
              />
            </div>

            <div className="w-px h-15 bg-gray-300/70 max-md:hidden"></div>

            <div className="flex flex-col">
              <label htmlFor="checkOutDate" className="font-medium">
                Check-Out
              </label>
              <input
                type="date"
                id="checkOutDate"
                placeholder="Check-Out"
                value={checkOutDate}
                min={checkInDate}
                disabled={!checkInDate}
                onChange={(e) => { setCheckOutDate(e.target.value); setIsAvailable(false); }}
                className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 
            outline-none"
                required
              />
            </div>

            <div className="w-px h-15 bg-gray-300/70 max-md:hidden"></div>

            <div className="flex flex-col">
              <label htmlFor="guests" className="font-medium">
                Guests
              </label>
              <input
                type="number"
                id="guests"
                placeholder="0"
                min={1}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 
            outline-none"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !room.isAvailable}
            className="disabled:opacity-60 bg-primary hover:bg-primary-dull 
        active:scale-95 transition-all text-white rounded-md max-md:w-full
        max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer"
          >
            {!room.isAvailable ? "Currently Unavailable" : loading ? "Please wait..." : isAvailable ? "Book Now" : "Check Availability"}
          </button>
        </form>

        {/* common specification */}

        <div className="mt-25 space-y-4">
          {roomCommonData.map((spec, index) => (
            <div key={index} className="flex items-start gap-2">
              <img
                src={spec.icon}
                alt={`${spec.title}-icon`}
                className="w-6.5"
              />
              <div>
                <p className="text-base">{spec.title}</p>
                <p className="text-gray-500">{spec.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500">
          <p>
            Experience comfort and elegance in our premium hotel rooms,
            thoughtfully designed to provide a relaxing and memorable stay. Each
            room features modern amenities, stylish interiors, high-speed Wi-Fi,
            air conditioning, a flat-screen TV, and a private bathroom with
            complimentary toiletries. Whether you're traveling for business or
            leisure, our spacious accommodations ensure maximum comfort and
            convenience. Enjoy exceptional hospitality, delicious dining
            options, and easy access to nearby attractions, making your stay
            truly unforgettable.
          </p>
        </div>
           {/* Hosted By */}
        <div className='flex flex-col items-start gap-4'>
            <div className="flex gap-4">
                <img src={room.hotel.owner?.image} alt="Host" className="h-14 w-14 
                md:h-18 rounded-full" />
                <div>
                    <p className="text-lg md:text-xl">Hosted By {room.hotel.name}</p>
                    <div className='flex items-center mt-1'>
                        <StarRating/>
                        <p className="ml-2">200+ reviews</p>
                    </div>
                </div>
            </div>
            <button className="px-6 py-2.5 mt-4 rounded text-white bg-primary
            hover:bg-primary-dull transition-all cursor-pointer">Contact Now</button>
        </div>
      </div>
    )
  );
};

export default RoomDetails;
