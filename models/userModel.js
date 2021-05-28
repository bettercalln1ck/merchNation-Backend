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
		default:'',
		required: true,
		immutable: true
	},
	lastName:{
		type:String,
		default:''
	},
	googleId:{
		type:String,
		default: ''
	},
	admin:{
		type:Boolean,
		default:false
	},
	phoneNumber:{
		type: Number,
		required: true,
		unique: true
	},
	confirmationCode:{
		type:String,
		default:''
	},
	status: {
		type: String, 
		enum: ['Pending', 'Active'],
		default: 'Pending'
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