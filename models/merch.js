const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;
var Float = require('mongoose-float').loadType(mongoose, 4);

var Rating =new Schema({
    author:  {
        type: mongoose.Schema.Types.ObjectId,
	ref: 'User'
    },
    comment:{
        type:String,    
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    }},{
        timestamps: true
})


var Color=new Schema({
    name:{
        type:String,
        required:true
    },
    code:{
        type:String,
        required:true
    }
})

var Varient=new Schema({
    color:{
        type:String,
        required:true
    },
    size:{
        type:String,
        enum: ['L','XL'],
        required: true
    },
    unitsInStock:{
        type:Number,
        min: 0,
        required: true
    }
})


var Category=new Schema({
    name:{
        type:String,
        required:true
    },
    colors:[Color],
    variants:[Varient]
})


const merchSchema= new Schema({
    name:{
        type:String,
        required:true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    description:{
        type: String,
        reuired:true
    },
    originalPrice:{
        type: Currency,
        required:true
    },
    offerPercent:{
        type: Float,
        required:true
    },
    category:Category,
    review:[Rating]
    },{
        timestamps: true
    })

    var Merchs=mongoose.model('Merch',merchSchema);

    module.exports= Merchs;