var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var passportLocalMongoose=require('passport-local-mongoose');

var Product=new Schema({
	color:{
        type:String,
        required:true
    },
    size:{
        type:String,
        enum: ['L','XL'],
        required: true
    },
	units:{
		type:Number,
        min: 0,
        required: true
	},
	merch:{
		type: mongoose.Schema.Types.ObjectId,
        ref: 'Merch'
	}
})

var User=new Schema({
	firstName:{
		type:String,
		default:''
	},
	lastName:{
		type:String,
		default:''
	},
	admin:{
		type:Boolean,
		default:false
	},
	seller:{
		type:Boolean,
		default:false
	},
	sellerInfo:{
		name: String,
      logo: String,
      description: String,
      rating: { type: Number, default: 0, required: true },
      numReviews: { type: Number, default: 0, required: true },
	},
	picture:{
		type:String,
		default:''
	},
	shippingAdd:{
		type: Array,
		contains:{
			type:String
		}
	},
	cart:[{
		merch:{type: mongoose.Schema.Types.ObjectId,ref: 'Merch',required: true},
		color:{type:String,required:true},
		size:{type:String,enum: ['L','XL'],required: true},
		units:{type:Number ,required:true}
		}],
	order:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },	
	pastOrders:[Product]
    },
    {
        timestamps: true
});

User.plugin(passportLocalMongoose);

module.exports=mongoose.model('User',User);