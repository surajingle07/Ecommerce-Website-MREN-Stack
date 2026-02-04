import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Edit, Search, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from '@/components/ui/card'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from '@/components/ui/textarea'
import ImageUpload from '@/components/ImagesUpload.jsx'
import axios from 'axios'
import { setProducts } from '@/redux/productSlice'
import { toast } from 'sonner'

const AdminProducts = () => {
  const { products } = useSelector(store => store.product)
  const [editProduct, setEditProduct] = useState(null)
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('')
  const accessToken = localStorage.getItem('accessToken')
  const dispatch = useDispatch()

  let filteredProducts = products.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (sortOrder === 'lowToHigh') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.productPrice - b.productPrice)
  }
  if (sortOrder === 'highToLow') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.productPrice - a.productPrice)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditProduct(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('productName', editProduct.productName)
    formData.append('productPrice', editProduct.productPrice)
    formData.append('brand', editProduct.brand)
    formData.append('category', editProduct.category)
    formData.append('productDesc', editProduct.productDesc)

    const existingImages = editProduct.productImg
      .filter(img => !(img instanceof File) && img.public?.id)
      .map(img => img.public.id)

    formData.append('existingImages', JSON.stringify(existingImages))

    editProduct.productImg
      .filter(img => img instanceof File)
      .forEach(file => {
        formData.append('files', file)
      })

    try {
      const res = await axios.put(
        `http://localhost:8000/api/v1/product/update/${editProduct._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (res.data.success) {
        toast.success('Product updated successfully')
        const updatedProducts = products.map(product =>
          product._id === editProduct._id ? res.data.product : product
        )
        dispatch(setProducts(updatedProducts))
        setOpen(false)
      }
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message || 'Something went wrong')
    }
  }

  const deleteProductHandler = async (productId) => {
    try {
      const remainingProducts = products.filter(product => product._id !== productId)
      const res = await axios.delete(
        `http://localhost:8000/api/v1/product/delete/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )
      if (res.data.success) {
        toast.success(res.data.message)
        dispatch(setProducts(remainingProducts))
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='pl-[350px] py-40 pr-40 flex flex-col gap-3 min-h-screen bg-gray-100'>
      <div className='flex justify-between'>
        <div className='relative bg-white rounded-lg'>
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search Products...'
            className='w-[400px]'
          />
          <Search className='absolute right-3 top-2 text-gray-500' />
        </div>

        <Select onValueChange={setSortOrder}>
          <SelectTrigger className="w-[200px] bg-white">
            <SelectValue placeholder="Sort By Price" />
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" align="start" className="bg-white" >
            <SelectItem value="lowToHigh">Price: Low to High</SelectItem>
            <SelectItem value="highToLow">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredProducts.map(product => (
        <Card key={product._id} className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className='flex gap-2 items-center'>
              <img src={product.productImg[0]?.url} className="w-24 h-24" />
              <h1 className="font-bold w-96">{product.productName}</h1>
            </div>

            <h1 className="font-semibold">₹{product.productPrice}</h1>

            <div className="flex gap-3">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Edit
                    onClick={() => {
                      setEditProduct(product)
                      setOpen(true)
                    }}
                    className="text-green-500 cursor-pointer"
                  />
                </DialogTrigger>

                <DialogContent className="sm:max-w-[625px] max-h-[740px] overflow-y-auto bg-white transpartent">
                  <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                    <DialogDescription>Update product details</DialogDescription>
                  </DialogHeader>

                  <Label>Product Name</Label>
                  <Input name="productName" value={editProduct?.productName} onChange={handleChange} />

                  <Label>Price</Label>
                  <Input type="number" name="productPrice" value={editProduct?.productPrice} onChange={handleChange} />

                  <Label>Brand</Label>
                  <Input name="brand" value={editProduct?.brand} onChange={handleChange} />

                  <Label>Category</Label>
                  <Input name="category" value={editProduct?.category} onChange={handleChange} />

                  <Label>Description</Label>
                  <Textarea name="productDesc" value={editProduct?.productDesc} onChange={handleChange} />

                  <ImageUpload productData={editProduct} setProductData={setEditProduct} />

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" className="bg-white hover:bg-red-500 hover:text-white">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave} className="bg-pink-500 text-white hover:bg-green-500">Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog >
                <AlertDialogTrigger>
                  <Trash2 className='text-red-500 cursor-pointer' />
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white hover:bg-red-500 hover:text-white">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteProductHandler(product._id)} className="bg-pink-500 text-white hover:bg-green-500">
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default AdminProducts