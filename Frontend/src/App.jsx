import React from "react";
import { Button } from "./components/ui/button";
import { createBrowserRouter,RouterProvider } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Verify from "./pages/Verify";
import VerifyEmail from "./pages/VerifyEmail";
import Footer from "./components/Footer";
import Profile from "./pages/Profile";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Dashboard from "./pages/Dashboard";
import AdminSales from "./pages/Admin/AdminSales";
import AddProducts from "./pages/Admin/AddProducts";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminUsers from "./pages/Admin/AdminUsers";
import UserInfo from "./pages/Admin/UserInfo";
import ShowUserOrders from "./pages/Admin/ShowUserOrders";
import ProtectedRoute from "./components/ProtectedRoute";
import SingleProducts from "./components/SingleProducts";
import AdminProducts from "./pages/Admin/AdminProducts";
import AddressForm from "./pages/AddressForm";

const router=createBrowserRouter([
  {
    path:'/',
    element:<><Navbar/><Home/><Footer/></>
  },
   {
    path:'/signup',
    element:<><Signup/></>
  },
   {
    path:'/login',
    element:<><Login/></>
  },
  {
    path:'/verify',
    element:<><Verify/></>
  },
  {
    path:'/profile/:userId',
    element:<ProtectedRoute><Navbar/><Profile/></ProtectedRoute>
  }
  ,
  {
    path:'/verify/:token',
    element:<><VerifyEmail/></>
  },
    {
    path:'/products/:id',
    element:<><Navbar/><SingleProducts/></>
  },
  {
    path:'/products',
    element:<><Navbar/><Products/></>
  },
  {
    path:'/cart',
    element:<ProtectedRoute><Navbar/><Cart/></ProtectedRoute>
  },
  {
    path:'/address',
    element:<ProtectedRoute><AddressForm/></ProtectedRoute>
  },
  {
    path:'/dashboard',
    element:<ProtectedRoute adminOnly={true}><Navbar/><Dashboard/></ProtectedRoute>,
    children:[
      {
        path:'sales',
        element:<AdminSales/>
      },
      {
        path:'add-product',
        element:<AddProducts/>
      },
      {
        path:'orders',
        element:<AdminOrders/>
      },
      {
        path:'users/orders/:userId',
        element:<ShowUserOrders/>
      },
      {
        path:'users',
        element:<AdminUsers/>
      },
      {
        path:'products',
        element:<AdminProducts/>
      },
      {
        path:'users/:userId',
        element:<UserInfo/>
      },

    ]
  }
])
const App=()=>{
  return(
    <>
      <RouterProvider router={router}/>
    </>
  )
}
export default App