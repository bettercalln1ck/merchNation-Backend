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
	userType:{
		type:String,
		default:''
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
		type: mongoose.Schema.Types.ObjectId,
        ref: 'Merch'
	}],
	wishList:[{
		type: mongoose.Schema.Types.ObjectId,
        ref: 'Merch'
	}],
	pastOrders:[Product]
    },
    {
        timestamps: true
});

User.plugin(passportLocalMongoose);

module.exports=mongoose.model('User',User);