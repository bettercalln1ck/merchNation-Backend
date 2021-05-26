const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic')
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;
var Float = require('mongoose-float').loadType(mongoose, 4);
var AWS= require('aws-sdk');

AWS.config.update({
    credentials: new AWS.Credentials(process.env.S3_KEY, process.env.S3_SECRET),
    region: 'ap-south-1'
  });

var connectionClass = require('http-aws-es');
var elasticsearch = require('elasticsearch');
var elasticClient = new elasticsearch.Client({  
    host: "https://search-products-75oijr7pifyosozzgptji3ynbu.ap-south-1.es.amazonaws.com/",
    log: 'error',
    connectionClass: connectionClass,
    awsConfig: new AWS.Config({
        credentials: new AWS.Credentials(process.env.S3_KEY, process.env.S3_SECRET),
        region: 'ap-south-1'
    })
});

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




var Varient=new Schema({
    color:{
        type:String,
        required:true,
        unique: true
    },
    colorCode:{
        type:String,
        unique: true
    },
    stock:[{
        size:{
            type:String,
            required: true
        },
        unitsInStock:{
            type:Number,
            min: 0,
            required: true
        }
    }],
    images:[{
        type:String
    }]

})


var Category=new Schema({
    name:{
        type:String,
        required:true,
        es_indexed: true
    },
    variants:{
    type:[Varient],
    es_indexed: true,
    es_type: 'nested',
    es_include_in_parent: true
    }
})


const merchSchema= new Schema({
    name:{
        type:String,
        required:true,
        es_indexed:true
    },
    shortDescription:{
        type: String,
        es_indexed:true
    },
    description:{
        type: String,
        es_indexed:true
    },
    originalPrice:{
        type: Currency,
        required:true,
        es_indexed:true
    },
    offerPercent:{
        type: Float,
        required:true,
        es_indexed:true
    },
    category:Category,
    tag:[{
        type:String,
        es_indexed:true
    }],
    review:[Rating]
    },{
        timestamps: true
    })

    merchSchema.plugin(mongoosastic,{        
            esClient: elasticClient         
    });

    var Merchs=mongoose.model('Merch',merchSchema);
        // stream = Merchs.synchronize(),
        // count = 0;
    
        // stream.on('data', function(err, doc){
        //     console.log(doc);
        //     count++;
        //     });
        // stream.on('close', function(){
        // console.log('indexed ' + count + ' documents!');
        // });
        // stream.on('error', function(err){
        // console.log(err);            .populate('seller')
        // });

    module.exports= Merchs;