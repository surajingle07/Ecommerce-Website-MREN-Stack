import { LayoutDashboard, PackagePlus, PackageSearch, User } from 'lucide-react'
import React from 'react'
import { FaRegEdit } from 'react-icons/fa'
import { NavLink } from 'react-router-dom'

 const Sidebar=()=>{
  return (
    <div className='hidden fixed md:block border-r bg-pink-50 border-pink-200 x-10 w-[300px] p-10 space-y-2 h-screen pt-30'>
      <div className='text-center pt-10 px-3 space-y-2'>
        <NavLink to='/dashboard/sales' className={({isActive})=>`text-xl ${isActive ? "bg-pink-600 text-gray-200" :"bg-transparent"} flex items-center gap-2 font-bold cursor-pointer p-3 rounded-md transition-all duration-200`}>
          <LayoutDashboard/><span>Dashboard</span>
        </NavLink>
        <NavLink to='/dashboard/add-product' className={({isActive})=>`text-xl ${isActive ? "bg-pink-600 text-gray-200" :"bg-transparent"} flex items-center gap-2 font-bold cursor-pointer p-3 rounded-md  transition-all duration-200`}>
          <PackagePlus/><span>Add Product</span>
        </NavLink>
        <NavLink to='/dashboard/products' className={({isActive})=>`text-xl ${isActive ? "bg-pink-600 text-gray-200" :"bg-transparent"} flex items-center gap-2 font-bold cursor-pointer p-3 rounded-md  transition-all duration-200`}>
          <PackageSearch/><span>Products</span>
        </NavLink>
        <NavLink to='/dashboard/users' className={({isActive})=>`text-xl ${isActive ? "bg-pink-600 text-gray-200" :"bg-transparent"} flex items-center gap-2 font-bold cursor-pointer p-3 rounded-md  transition-all duration-200`}>
          <User/><span>Users</span>
        </NavLink>
        <NavLink to='/dashboard/orders' className={({isActive})=>`text-xl ${isActive ? "bg-pink-600 text-gray-200" :"bg-transparent"} flex items-center gap-2 font-bold cursor-pointer p-3 rounded-md  transition-all duration-200`}>
          <FaRegEdit/><span>Orders</span>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar