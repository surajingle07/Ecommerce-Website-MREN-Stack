/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { Button, Input } from '@base-ui/react';
import axios from 'axios';
import { Edit, Eye, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import UserLogo from '../../assets/userlogo.png';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate=useNavigate();

    const getAllUsers = async () => {
      // eslint-disable-next-line no-unused-vars
      const accessToken = localStorage.getItem('accessToken');
      try {
        const res = await axios.get('http://localhost:8000/api/v1/user/all-user',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }) 
        if (res.data.success) {
          setUsers(res.data.users);
        }
      } catch (error) {
        console.log(error);
      }
    }
    const filteredUsers = users.filter((user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    useEffect(() => {
      getAllUsers();
    }, []);
    console.log(users);
  return (
      <div className='pl-[350px] py-20 pr-20 mx-auto pt-40 px-4'>
      <h1 className='text-3xl font-bold mb-6'>User Management</h1>
      <p>View and manage all users in the system.</p>
      <div className='flex related w-[300px] mt-6'>
        <Search className='absolute right-3 top-2 text-gray-500' />
        <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          placeholder='Search users...'
          className='w-full p-2 border border-gray-300 rounded-md pl-10'
        />
      </div>
      <div className='grid grid-cols-3 gap-7 mt-7'>
        {
          filteredUsers.map((user,index)=>{
            return <div key={index} className='bg-pink-100 p-5 rounded-lg shadow-md'>
              <div className='flex gap-3 flex-1'>
                <img src={user?.profilePic || UserLogo} alt="" className="w-16 h-16 rounded-full aspect-square object-cover border border-pink-300 mb-2" />
                <div>
                  <h1 className='font-semibold'>{user?.firstName} {user?.lastName}</h1>
                  <h3 className='text-gray-500'>{user?.email}</h3>
                </div>
              </div>
              <div className='flex gap-3 mt-3'>
                <Button onClick={()=>navigate(`/dashboard/users/${user?._id}`)} className='bg-black p-2  rounded-lg text-white hover:bg-white hover:text-black'><Edit/></Button>
                <Button className='bg-black p-2 rounded-lg text-white hover:bg-red-600'>Show Orders</Button>

              </div>
              
            </div>
          })
        }

      </div>
    </div>
  )
}

export default AdminUsers