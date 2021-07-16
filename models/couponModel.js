const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var Coupon = new Schema({
    couponCode:{
        type:String,
        unique:true
    },
    discountPercentage:{
        type:Number
    },
    tags:[{
            type: String
    }]
},{
    timestamps: true
})

module.exports = mongoose.model('Coupon',Coupon);;