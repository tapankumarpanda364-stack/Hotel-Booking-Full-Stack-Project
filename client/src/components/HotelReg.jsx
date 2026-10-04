import React, { useState } from 'react'
import { assets, cities } from '../assets/assets'
import { toast } from 'react-hot-toast'
import { useAppContext } from '../context/AppContext'
import { getErrorMessage } from '../utils/api'

const HotelReg = () => {
  const { axios, authHeaders, setShowHotelReg, setIsOwner } = useAppContext()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [contact, setContact] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.post('/api/hotels', { name, address, contact, city }, await authHeaders())
      if (data.success) {
        toast.success(data.message)
        setIsOwner(true)
        setShowHotelReg(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center
     justify-center bg-black/70' onClick={() => setShowHotelReg(false)}>
        <form onSubmit={onSubmitHandler} onClick={(e) => e.stopPropagation()} className='flex bg-white rounded-xl max-w-4xl max-md:mx-2'>
            <img src={assets.regImage} alt="reg-image" className='w-1/2 rounded-xl 
            hidden md:block' />

            <div className='relative flex flex-col items-center md:w-1/2 p-8 md:p-10'>
                <img src={assets.closeIcon} alt="close-icon" onClick={() => setShowHotelReg(false)} className='absolute top-4 right-4 h-4
                 w-4 cursor-pointer ' />
                 <p className='text-2xl font-semibold mt-6 '>Register Your Hotel</p>

                    {/* hotel name */}
                 <div className='w-full mt-4 '>
                     <label htmlFor="name" className='font-medium text-gray-500'>
                        Hotel Name
                     </label>
                     <input id='name' type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Type here" className="border
                      border-gray-200 rounded w-full px-3 py-2.5 mt-1
                       outline-indigo-500 font-light" required />
                 </div>
                 {/* Phone contact details */}

                  <div className='w-full mt-4 '>
                     <label htmlFor="contact" className='font-medium text-gray-500'>
                        Phone
                     </label>
                     <input id='contact' type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Type here" className="border
                      border-gray-200 rounded w-full px-3 py-2.5 mt-1
                       outline-indigo-500 font-light" required />
                 </div>
                 {/* Address of the hotel */}

                  <div className='w-full mt-4 '>
                     <label htmlFor="address" className='font-medium text-gray-500'>
                        Address
                     </label>
                     <input id='address' type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Type here" className="border
                      border-gray-200 rounded w-full px-3 py-2.5 mt-1
                       outline-indigo-500 font-light" required />
                 </div>

                 {/* select city dropdown */}

                 <div className='w-full mt-4 max-w-60 mr-auto'>
                    <label htmlFor="city" className='font-medium text-gray-500 '>
                       City
                    </label>
                    <select id="city" value={city} onChange={(e) => setCity(e.target.value)} className='border border-gray-200 
                    rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light' required>
                        <option value="">Select City</option>
                        {cities.map((city) => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                 </div>
                 <button type="submit" disabled={loading} className='disabled:opacity-60 bg-indigo-500 hover:bg-indigo-600 transition-all
                  text-white mr-auto px-6 py-2 rounded cursor-pointer mt-6'>
                    Register
                 </button>
            </div>

        </form>
    </div>
  )
}

export default HotelReg