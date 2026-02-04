import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import userLogo from '../assets/userlogo.png'
import { toast } from "sonner"
import axios from "axios"
import { setUser } from "@/redux/userSlice"

const Profile = () => {
    const params = useParams()
    const { user } = useSelector(store => store.user)
    const dispatch = useDispatch()
    const userId = params.userId
    const [updateUser, setUpdateUser] = useState({
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        phoneNo: user?.phoneNo,
        address: user?.address,
        city: user?.city,
        zipCode: user?.zipCode,
        profilePic: user?.profilePic,
        role: user?.role

    })
    const [file, setFile] = useState(null)
    const handleChange = (e) => {
        setUpdateUser({ ...updateUser, [e.target.name]: e.target.value })
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        setFile(selectedFile)
        setUpdateUser({ ...updateUser, profilePic: URL.createObjectURL(selectedFile) })
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        const accessToken = localStorage.getItem("accessToken")
        try {
            const formData = new FormData()
            formData.append("firstName", updateUser.firstName)
            formData.append("lastName", updateUser.lastName)
            formData.append("email", updateUser.email)
            formData.append("phoneNo", updateUser.phoneNo)
            formData.append("address", updateUser.address)
            formData.append("city", updateUser.city)
            formData.append("zipCode", updateUser.zipCode)
            formData.append("role", updateUser.role)

            if (file) {
                formData.append("file", file)
            }

            const res = await axios.put(
                `http://localhost:8000/api/v1/user/update/${userId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            )

            if (res.data.success) {
                toast.success(res.data.message)
                dispatch(setUser(res.data.user))
            }
        } catch (error) {
            console.log(error)
            toast.error("Failed to update profile")
        }
    }

    return (
        <div className="pt-40 flex justify-center">
            <div className="w-full max-w-2xl space-y-6">

                <Tabs defaultValue="profile" className=" space-y-4">

                    <TabsList>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                    </TabsList>

                    {/* Account */}
                    <TabsContent value="profile">
                        <div>
                            <div className="flex flex-col justify-center items-center">
                                <h1 className="font-bold mb-7 text-2xl text-gray-800">
                                    Update Profile
                                </h1>

                                <div className="w-full flex gap-10 justify-between items-start px-7 max-w-2xl">

                                    {/* profile picture */}
                                    <div className="flex flex-col items-center">
                                        <img
                                            src={updateUser?.profilePic || userLogo}
                                            alt="profile"
                                            className="w-32 h-32 rounded-full object-cover border-4 border-pink-800"
                                        />

                                        <Label className="mt-4 cursor-pointer bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700">
                                            Change Picture
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </Label>
                                    </div>

                                    {/* profile form */}
                                    <form onSubmit={handleSubmit} className="space-y-4 shadow-lg p-5 rounded-lg bg-white">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="block text-sm font-medium">
                                                    First Name
                                                </Label>
                                                <Input
                                                    type="text"
                                                    name="firstName"
                                                    placeholder='Alex'
                                                    value={updateUser.firstName}
                                                    onChange={handleChange}
                                                    className="w-full border rounded-lg px-3 py-2 mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label className="block text-sm font-medium">
                                                    Last Name
                                                </Label>
                                                <Input
                                                    type="text"
                                                    name="lastName"
                                                    placeholder='Doe'
                                                    value={updateUser.lastName}
                                                    onChange={handleChange}
                                                    className="w-full border rounded-lg px-3 py-2 mt-1"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="block text-sm font-medium">
                                                Email
                                            </Label>
                                            <Input
                                                type="email"
                                                name="email"
                                                value={updateUser.email}
                                                onChange={handleChange}
                                                disabled
                                                className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-100 cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <Label className="block text-sm font-medium">
                                                Phone Number
                                            </Label>
                                            <Input
                                                type="text"
                                                name="phoneNo"
                                                placeholder='Enter your Contact No'
                                                value={updateUser.phoneNo}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-3 py-2 mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="block text-sm font-medium">
                                                Address
                                            </Label>
                                            <Input
                                                type="text"
                                                name="address"
                                                placeholder='Enter your Address'
                                                value={updateUser.address}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-3 py-2 mt-1"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="block text-sm font-medium">
                                                    City
                                                </Label>
                                                <Input
                                                    type="text"
                                                    name="city"
                                                    placeholder='Enter your City'
                                                    value={updateUser.city}
                                                    onChange={handleChange}
                                                    className="w-full border rounded-lg px-3 py-2 mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label className="block text-sm font-medium">
                                                    ZipCode
                                                </Label>
                                                <Input
                                                    type="text"
                                                    name="zipCode"
                                                    placeholder='Enter your ZipCode'
                                                    value={updateUser.zipCode}
                                                    onChange={handleChange}
                                                    className="w-full border rounded-lg px-3 py-2 mt-1"
                                                />
                                            </div>

                                        </div>
                                        <Button type='submit' className='w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 rounded-lg'>
                                            Update Profile
                                        </Button>
                                    </form>

                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Password */}
                    <TabsContent value="orders">
                        <Card>
                            <CardHeader>
                                <CardTitle>Password</CardTitle>
                                <CardDescription>
                                    Change your password here. After saving, you'll be logged out.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label>Current password</Label>
                                    <Input type="password" />
                                </div>

                                <div className="grid gap-3">
                                    <Label>New password</Label>
                                    <Input type="password" />
                                </div>
                            </CardContent>

                            <CardFooter>
                                <Button className='bg-black text-white'>Save password</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>
        </div>
    )
}

export default Profile
