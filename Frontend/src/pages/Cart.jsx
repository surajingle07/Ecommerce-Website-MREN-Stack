import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import userlogo from '../assets/userlogo.png'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { setCart } from '@/redux/productSlice'
import { toast } from 'sonner'

const Cart = () => {
  const { cart } = useSelector(store => store.product)
  const subtotal = cart?.totalPrice
  const shipping = subtotal > 299 ? 0 : 10;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accessToken = localStorage.getItem('accessToken');

  const loadCart = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/v1/cart/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      if (res.data.success) {
        dispatch(setCart(res.data.cart))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleupdateQuantity = async (productId, type) => {
    try {
      const res = await axios.put(`http://localhost:8000/api/v1/cart/update`,
        {
          productId,
          type
        }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      if (res.data.success) {
        console.log('Quantity updated')
        dispatch(setCart(res.data.cart))
      }


    } catch (error) {
      console.error(error)

    }
  }
  const handleRemoveFromCart = async (productId) => {
    try {
      const res = await axios.delete(`http://localhost:8000/api/v1/cart/remove`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        data: {
          productId
        }
      });

      if (res.data.success) {
        dispatch(setCart(res.data.cart));
        toast.success('Product removed from cart');
      }

    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    loadCart();
  }, [dispatch]);

  return (
    <div className='pt-30 bg-gray-50 min-h-screen'>
      {cart?.items?.length > 0 ? (
        <div className='max-w-7xl mx-auto p-5'>
          <h1 className='text-3xl font-bold text-black mb-7'>Your Shopping Cart</h1>

          <div className='max-w-7xl mx-auto flex gap-7'>
            <div className='flex flex-col gap-5 flex-1'>
              {cart.items.map((product, index) => (
                <Card key={index} className='p-3 border  shadow border-gray-300'>
                  <div className='flex justify-between items-center pr-7'>
                    <div className='flex items-center w-[350px]'>
                      <img
                        src={product?.productId?.productImg?.[0]?.url || userlogo}
                        alt=''
                        className='w-20 h-20 m-2 rounded-md object-cover '
                      />
                      <div className='w-[280px] m-4'>
                        <h1 className='font-semibold truncate'>{product?.productId?.productName}</h1>
                        <p className='text-gray-500'>₹{product?.productId?.productPrice}</p>
                      </div>
                    </div>
                    <div className='flex gap-5 items-center'>
                      <Button onClick={() => handleupdateQuantity(product.productId._id, 'decrease')} variant='outline'>-</Button>
                      <span className='font-semibold'>{product.quantity}</span>
                      <Button onClick={() => handleupdateQuantity(product.productId._id, 'increase')} variant='outline'>+</Button>

                    </div>
                    <p>₹{(product?.productId?.productPrice) * (product?.quantity)}</p>
                    <p onClick={() => handleRemoveFromCart(product?.productId?._id)} className='flex text-red-500 items-center gap-1 cursor-pointer'><Trash2 />Remove</p>
                  </div>
                </Card>
              ))}
            </div>
            <div>
              <Card className='w-[400]px'>
                <CardHeader>
                  <CardTitle>
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Subtotal({cart.items.length}) items</span>
                    <span>₹{cart?.totalPrice?.toLocaleString('en-In')}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Shipping</span>
                    <span>₹{shipping?.toLocaleString('en-In')}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Tax(5%)</span>
                    <span>₹{tax}</span>
                  </div>
                  <Separator />
                  <div className='flex justify-between font-bold text-lg'>
                    <span>Total</span>
                    <span>₹{total?.toLocaleString('en-In')}</span>
                  </div>
                  <div className='space-y-3 pt-4'>
                    <div className='flex space-x-2'>
                      <Input placeholder='Enter Coupon Code' className='flex-1' />
                      <Button variant='outline'>Apply</Button>
                    </div>
                    <div>
                      <Button onClick={() => navigate('/address')} className='w-full bg-pink-600 text-white mb-3'>Place Order</Button>
                      <Button variant='outline' className='w-full bg-tarasparent'>
                        <Link to='/products'>Continue Shopping</Link>

                      </Button>
                      <div className='text-sm text-gray-400 text-muted-foreground pt-4'>
                        <p>* Free Shipping on order over ₹299</p>
                        <p>* 30 Days Return Policy</p>
                        <p>* Cash on Delivery Available</p>
                        <p>* Secure checkout with SSL encryption</p>

                      </div>

                    </div>

                  </div>

                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className='text-center pt-40 flex flex-col items-center gap-6'>
          <div className='bg-pink-100 p-6 rounded-full'>
            <ShoppingCart className='w-30 h-30 text-pink-600' size={50} />
          </div>
          <h1 className='text-2xl font-bold'>Your Cart is Empty</h1>
          <p className='text-gray-500'>Looks like you haven't added anything to your cart yet.</p>
          <Button onClick={() => navigate('/products')} className='cursor-pointer hover:bg-black bg-pink-600 text-white mb-3'>Start Shopping</Button>
        </div>
      )}
    </div>
  )
}

export default Cart
