import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import { toast } from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import { getErrorMessage } from "../../utils/api";

const ListRoom = () => {
  const { axios, authHeaders, fetchRooms: refreshPublicRooms } = useAppContext();
  const [rooms, setRooms] = useState([]);

  const fetchOwnerRooms = async () => {
    try {
      const { data } = await axios.get("/api/rooms/owner", await authHeaders());
      if (data.success) setRooms(data.rooms);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const toggleAvailability = async (roomId) => {
    try {
      const { data } = await axios.patch(`/api/rooms/${roomId}/availability`, {}, await authHeaders());
      if (data.success) {
        toast.success(data.message);
        setRooms((prev) =>
          prev.map((r) => (r._id === roomId ? { ...r, isAvailable: data.room.isAvailable } : r))
        );
        refreshPublicRooms(); // keep the public room list in sync
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    fetchOwnerRooms();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <Title
        align="left"
        font="outfit"
        title="Room Listings"
        subTitle="View, edit, or manage all listed room.
        keep the information up-to-date to provide the best experience for user. "
      />
      <p className="text-gray-500 mt-8">All Rooms</p>

      <div
        className="w-full max-w-3xl text-left border border-gray-300 rounded-lg 
        max-h-80 overflow-y-scroll mt-3"
      >
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-gray-800 font-medium "> Name</th>
              <th className="py-3 px-4 text-gray-800 font-medium max-sm:hidden ">
                Facility
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium  ">
                Price / night
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center ">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {rooms.map((item, index) => (
              <tr key={index}>
                <td
                  className='py-3 px-4 text-gray-700 border-t 
                             border-gray-300'
                >
                  {item.roomType}
                </td>

                <td
                  className='py-3 px-4 text-gray-700 border-t 
                             border-gray-300 max-sm:hidden'
                >
                  {item.amenities.join(', ')}
                </td>

                 <td
                  className='py-3 px-4 text-gray-700 border-t 
                             border-gray-300 '
                >
                 $ {item.pricePerNight}
                </td>

                 <td
                  className='py-3 px-4 text-center border-t 
                             border-gray-300 text-sm text-red-500'
                >
                  <label  className='relative inline-flex items-center 
                  cursor-pointer text-gray-900 gap-3'>
                      <input type="checkbox" className='sr-only peer' onChange={() => toggleAvailability(item._id)} checked={item.
                        isAvailable
                      } />
                      <div className="w-12 h-7 bg-slate-300 rounded-full peer
                       peer-checked:bg-blue-600 transition-colors duration-200">
                        <span className='dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full 
                        transition-transform duration-200 ease-in-out peer-checked:translate-x-5'></span>
                       </div>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListRoom;
