import ImagesUpload from '@/components/ImagesUpload'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { setProducts } from '@/redux/productSlice'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const AddProducts = () => {
  const accessToken = localStorage.getItem('accessToken')
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const { products } = useSelector(state => state.product)

  const [productData, setProductData] = useState({
    productName: '',
    productPrice: '',
    productDesc: '',
    productImg: [],
    brand: '',
    category: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setProductData(prev => ({ ...prev, [name]: value }))
  }

  const submitHandler = async (e) => {
    e.preventDefault()

    if (productData.productImg.length === 0) {
      toast.error('Please upload at least one image')
      return
    }

    const formData = new FormData()
    formData.append('productName', productData.productName)
    formData.append('productPrice', productData.productPrice)
    formData.append('productDesc', productData.productDesc)
    formData.append('brand', productData.brand)
    formData.append('category', productData.category)

    productData.productImg.forEach(img => {
      formData.append('files', img)
    })

    try {
      setLoading(true)
      const res = await axios.post(
        'http://localhost:8000/api/v1/product/add',
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (res.data.success) {
        dispatch(setProducts([...products, res.data.product]))
        toast.success(res.data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='pl-[350px] pr-20 py-40 bg-gray-100 border-gray-300 '>
      <Card className='w-full shadow-lg'>
        <CardHeader>
          <CardTitle className='font-bold font-size-[30px]'>Add Product</CardTitle>
          <CardDescription>Enter product details below</CardDescription>
        </CardHeader>

        <form onSubmit={submitHandler}>
          <CardContent className='flex flex-col gap-4'>
            <div className='grid gap-2'>
              <Label>Product Name</Label>
              <Input className='border-gray-300 hover:border-gray-500'
                name='productName'
                value={productData.productName}
                onChange={handleChange}
                required
              />
            </div>

            <div className='grid gap-2'>
              <Label>Price</Label>
              <Input className='border-gray-300 hover:border-gray-500'
                type='number'
                name='productPrice'
                value={productData.productPrice}
                onChange={handleChange}
                required
              />
            </div>
            <div className='flex' > 
            <div className='grid gap-2 mr-50'>
              <Label>Brand</Label>
              <Input className='border-gray-300 hover:border-gray-500'
                name='brand'
                value={productData.brand}
                onChange={handleChange}
                required
              />
            </div>
              <div className='grid gap-2 text-right '>
                <Label>Category</Label>
                <Input className='border-gray-300 hover:border-gray-500'
                  name='category'
                  value={productData.category}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>


            <div className='grid gap-2 boder '>
              <Label>Description</Label>
              <Textarea className='border-gray-300 hover:border-gray-500'
                name='productDesc'
                value={productData.productDesc}
                onChange={handleChange}
              />
            </div>

            <ImagesUpload productData={productData} setProductData={setProductData} />
          </CardContent>

          <CardFooter>
            <Button disabled={loading} onClick={submitHandler} type='submit' className=' w-full mt-10 bg-pink-600 text-white mt-10 hover:bg-black cursor-pointer' >
              {
                loading ? <span className='flex gap-1 items-center'><Loader2 className='animate-spin' size={16} /> Adding Product...</span>
                  : 'Add Product'
              }
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default AddProducts
