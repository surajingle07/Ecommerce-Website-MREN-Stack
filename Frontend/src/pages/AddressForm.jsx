import { addAddress, deleteAddress, setCart, setSelectedAddress } from '@/redux/productSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@base-ui/react';
import { Label } from '@radix-ui/react-label';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";

const AddressForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, addresses, selectedAddress } = useSelector(store => store.product);
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    dispatch(addAddress(formData));

    setFormData({
      fullName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: ""
    });

    setShowForm(false);
  };
  const subtotal = cart.totalPrice;
  const shipping = subtotal > 299 ? 0 : 10;
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = parseFloat(subtotal) + parseFloat(shipping) + parseFloat(tax);

  const handlePayment = async () => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_URL}/api/v1/orders/create-order`, {
        products: cart?.items?.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
        })),
        tax:Number(tax),
        shipping,
        amount: Math.round(total),
        currency: "INR"
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!data.success) return toast.error("Failed to create order");
      console.log("Order created:", data);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,
        name: "Ekart",
        description: "Order Payment",

        handler: async function (response) {
          try {
            const verifyRes = await axios.post(`${import.meta.env.VITE_URL}/api/v1/orders/verify-payment`,
              response,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });
            if (verifyRes.data.success) {
              toast.success("Payment Successful!");
              dispatch(setCart({ items: [], totalItems: 0, totalPrice: 0 }));
              navigate("/order-success");
            } else {
              toast.error("❌ Payment verification failed");
            }
          } catch (error) {
            toast.error("Error verifying payment: " + error.message);
          }
        },
        modal: {
          ondismiss: async function () {
            await axios.post(`${import.meta.env.VITE_URL}/api/v1/orders/verify-payment`, {
              razorpay_order_id: data.order.id,
              paymentFailed: true,
            }, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
            toast.error("Payment cancelled or failed");
          },
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },

      }
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (response) {
        await axios.post(`${import.meta.env.VITE_URL}/api/v1/orders/verify-payment`, {
          razorpay_order_id: data.order.id,
          paymentFailed: true,
        }, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error("Error creating order");
    }
  };


  return (
    <div className="max-w-7xl mx-auto mt-10 p-10 flex flex-row justify-between gap-10">
      <div className="bg-white p-6 rounded-md shadow flex-1">

        {showForm ? (
          <>
            <div className="flex flex-col mb-3">
              <Label className='font-semibold'>Full Name</Label>
              <Input name="fullName" placeholder='john' required className="border border-gray-300 rounded-md p-2" value={formData.fullName} onChange={handleChange} />
            </div>

            <div className="flex flex-col mb-3">
              <Label className='font-semibold'>Phone</Label>
              <Input name="phone" placeholder='1234567890' required className="border border-gray-300 rounded-md p-2" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="flex flex-col mb-3">
              <Label className='font-semibold'>Email</Label>
              <Input name="email" placeholder='john@example.com' required className="border border-gray-300 rounded-md p-2" value={formData.email} onChange={handleChange} />
            </div>

            <div className="flex flex-col mb-3">
              <Label className='font-semibold' >Address</Label>
              <Input name="address" placeholder='123 Main Street' required className="border border-gray-300 rounded-md p-2" value={formData.address} onChange={handleChange} />
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col mb-3">
                <Label className='font-semibold'>City</Label>
                <Input name="city" placeholder='New York' required className="border border-gray-300 rounded-md p-2" value={formData.city} onChange={handleChange} />
              </div>

              <div className="flex flex-col mb-3">
                <Label className='font-semibold'>State</Label>
                <Input name="state" placeholder='NY' required className="border border-gray-300 rounded-md p-2" value={formData.state} onChange={handleChange} />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col mb-3">
                <Label className='font-semibold'>Zip</Label>
                <Input name="zip" placeholder='12345' className="border border-gray-300 rounded-md p-2" value={formData.zip} onChange={handleChange} />
              </div>

              <div className="flex flex-col mb-3">
                <Label className='font-semibold'>Country</Label>
                <Input name="country" placeholder='USA' className="border border-gray-300 rounded-md p-2" value={formData.country} onChange={handleChange} />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full bg-pink-600 text-white mt-3 hover:bg-black">
              Save & Continue
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">Saved Addresses</h2>

            {addresses.map((addr, index) => (
              <div
                key={index}
                onClick={() => dispatch(setSelectedAddress(index))}
                className={`relative p-4 mb-3 border rounded cursor-pointer ${selectedAddress === index ? 'border-pink-600 bg-pink-100' : 'border-gray-300'
                  }`}
              >
                <p><b>{addr.fullName}</b></p>
                <p>{addr.phone}</p>
                <p>{addr.email}</p>
                <p>{addr.address}, {addr.city}, {addr.state}</p>
                <p>{addr.zip}, {addr.country}</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(deleteAddress(index));
                  }}
                  className="absolute top-2 right-2 text-red-500 text-sm hover:bg-red-100 rounded px-2 py-1"
                >
                  Delete
                </button>
              </div>
            ))}

            <Button variant="outline" onClick={() => setShowForm(true)} className=' w-full cursor-pointer hover:bg-black bg-pink-500 text-white mb-3'>
              + Add New Address
            </Button>
            <Button onClick={handlePayment} variant='outline' className="w-full bg-black text-white hover:bg-pink-500">Continue to Checkout</Button>
          </>
        )}

      </div>
      {/* Right side summary */}
      <div >
        <Card className='w-[500px] ml-10 border border-gray-300 shadow-md'>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal ({cart.items.length}) items</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>₹{shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>₹{tax}</span>
              </div>
              <Separator className='border-t border-gray-300 my-2' />
              <div className="flex justify-between font-bold mt-2">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            <div className='text-sm text-gray-400 text-muted-foreground pt-4'>
              <p>* Free Shipping on order over ₹299</p>
              <p>* 30 Days Return Policy</p>
              <p>* Cash on Delivery Available</p>
              <p>* Secure checkout with SSL encryption</p>

            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddressForm;