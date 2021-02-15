var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var passportLocalMongoose=require('passport-local-mongoose');

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
	pastOrders:[{
		type: mongoose.Schema.Types.ObjectId,
        ref: 'Merch'
	}]
    },
    {
        timestamps: true
});

User.plugin(passportLocalMongoose);

module.exports=mongoose.model('User',User);