const mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const orderSchema = new mongoose.Schema(
  {
    orderItems: [
//      {
//        name: { type: String, required: true },
//        qty: { type: Number, required: true },
//        image: { type: String, required: true },
//        price: { type: Number, required: true },
//        products: [{
        {  
          merch:{type: mongoose.Schema.Types.ObjectId,ref: 'Merch',required: true},
          color:{type:String,required:true},
          size:{type:String,enum: ['L','XL'],required: true},
          units:{type:Number ,required:true}
        } 
//          }],
//      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      lat: Number,
      lng: Number,
    },
    paymentMethod: { type: String},
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
//    itemsPrice: { type: Currency, required: true },
//    shippingPrice: { type: Currency, required: true },
//    taxPrice: { type: Currency, required: true },
    totalPrice: { type: Currency, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
 //   seller: { type: mongoose.Schema.Types.ObjectID, ref: 'User' },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    //TODO  deliveryState:{type: String} 1.success  2.pending 3.active  4.canceled
    
  },
  {
    timestamps: true,
  }
);

var Order = mongoose.model('Order', orderSchema);

module.exports= Order;