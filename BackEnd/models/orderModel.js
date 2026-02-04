import mongosse from 'mongoose';
const orderSchema = new mongosse.Schema({
    user: {
        type: mongosse.Schema.Types.ObjectId,
        ref: 'User', required: true
    },
    products: [{
        productId: { type: mongosse.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, default: 1 },
    }],
    amount: { type: Number, required: true },
    tax: { type: Number, required: true },
    shipping: { type: Number, required: true },
    currency: { type: String, required: true, default: 'INR' },
    status: { type: String, required: true, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },


    //rozopay fields
    razopayOrderId: { type: String },
    razopayPaymentId: { type: String },
    razopaySignature: { type: String }, 
}, { timestamps: true })

export const Order = mongosse.model('Order', orderSchema);