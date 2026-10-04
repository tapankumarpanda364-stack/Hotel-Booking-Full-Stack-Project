import React, { useEffect } from 'react'
import Navbar from '../../components/hotelOwnwr/Navbar'
import Sidebar from '../../components/hotelOwnwr/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const Layout = () => {
  const { isOwner, authReady, navigate } = useAppContext()

  // Wait until we know the user's role (authReady), otherwise a page refresh would bounce owners to Home
  useEffect(() => {
    if (authReady && !isOwner) navigate('/')
  }, [authReady, isOwner])

  if (!authReady || !isOwner) return null

  return (
    <div className='flex flex-col h-screen'>
        <Navbar/>
        <div className='flex h-full'>
            <Sidebar/>
            <div className='flex-1 p-4 pt-10 md:px-10 h-full'>
                <Outlet/>
            </div>
        </div>
    </div>
  )
}

export default Layout