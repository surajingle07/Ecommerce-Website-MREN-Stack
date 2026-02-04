import React from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { setCart } from '@/redux/productSlice'

const ProductDesc = ({ product }) => {
  const accessToken = localStorage.getItem('accessToken')
  const dispatch=useDispatch()
  const addToCart = async(productId) => {
    try {
      const res = await axios.post(`http://localhost:8000/api/v1/cart/add`,{productId}, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      if(res.data.success) {
        toast.success("Product added to cart successfully!")
        dispatch(setCart(res.data.cart))
      }
    } catch (error) {
      console.error(error)
      
      
    }
  }
  return (
    <div className='flex flex-col gap-4'>

      <h1 className='font-bold text-4xl text-gray-800'>{product?.productName}</h1>
      <p className='text-gray-800'>{product.category}| {product.brand}</p>
      <h2 className='font-bold text-2xl text-pink-600'>₹{product?.productPrice}</h2>
      <p className='line-clamp-5'>{product?.productDesc}</p>
      <div className='flex gap-4 mt-5 items-center w-[300px]'>
        <p className='text-gray-800 font-semibold'>Qantity</p>
        <Input type='number' className='w-14' defaultValue={1} min={1} /> 

      </div>
      <Button onClick={() => addToCart(product._id)} className='mt-5 bg-pink-600 w-max text-white hover:bg-black'>Add to Cart</Button>
    </div>
  )
}

export default ProductDesc