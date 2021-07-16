const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const {Merchs,Comments} = require('../models/merchModel');
const Coupon = require('../models/couponModel')
const Users = require('../models/userModel')

const merchRouter = express.Router();
var authenticate = require('../authenticate');
const stripe = require("stripe")("sk_test_51IO7TIK1JmW0iRErJG70YmZ68knfrleuuuEJ7tyYEUpTZN15Z1wXRPbmLdDpWlf8TxgUWF9u7m2vqWJ390OzdQM100xY19tz2c");
const shortid = require('shortid');

const Razorpay = require('razorpay')
const razorpay = new Razorpay({
    key_id: 'rzp_test_s6HVQD9M4O67YD',
    key_secret: 'fJ1uvi5d41uNMBobhDJdNWes'
})


merchRouter.use(bodyParser.json());

merchRouter.route('/')
.options( (req, res) => {res.sendStatus(200); })
.get(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
    Merchs.find({})
    .then((merch) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:true,merch});
},(err) => next(err))
.catch((err) => next(err));

});

merchRouter.route('/addMerch')
.options( (req, res) => {res.sendStatus(200); })
.post(authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
    if(req.body != null)
    {
        req.body.seller=req.user._id;
        Merchs.create(req.body)
        .then((merch)=>{
            Merchs.findById(merch._id)
            .then((merch) =>{
 //           merch.seller=req.user._id;
            res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success:true,merch});
            })
        },(err) => next(err))
        .catch((err) => next(err));
    }else{
        err = new Error('Merch info not found in request body');
        err.status = 404;
        return next(err);
    }
})
.put( authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /addMerch');
})
.delete( authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	res.statusCode = 403;
    res.end('PUT operation not supported on /addMerch');	        
});

const calculateOrderAmount = items => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 1400;
  };


/*merchRouter.post('/orders', async (req, res) => {
    const options = {
        amount: req.body.amount,
        currency: 'INR',
        receipt: shortid.generate(), //any unique id
        payment_capture = 1 //optional
    }
    try {
        const response = await razorpay.orders.create(options)
        res.json({
            order_id: response.id,
            currency: response.currency,
            amount: response.amount
        })
    } catch (error) {
        console.log(error);
        res.status(400).send('Unable to create order');
    }
})
  
merchRouter.post("/create-payment-intent", async (req, res) => {
    const { items } = req.body;
    // Create a PaymentIntent with the order amount and currency
    paymentIntent = await stripe.paymentIntents.create({
        amount: 1099,
        currency: 'usd',
        description: 'Software development services',
      });

     customer = await stripe.customers.create({
        name: 'Jenny Rosen',
        address: {
          line1: '510 Townsend St',
          postal_code: '98140',
          city: 'San Francisco',
          state: 'CA',
          country: 'US',
        }
      });

    res.send({
      clientSecret: paymentIntent.client_secret
    });
  });
  
*/

merchRouter.route('/:merchId')
.options( (req, res) => {res.sendStatus(200); })
.get(authenticate.verifyUser,async (req,res,next)=>{
    Merchs.findById(req.params.merchId)
    .then(async (merch) =>{
    //     var variants = merch.category.variants;
    //     var mp = new Map();
    //    await Promise.all(
    //        variants.map(async (item,) =>{
    //         const key = item.color;
    //         const data = {size : item.size,unitsInStock : item.unitsInStock}
    //         const collection = await mp.get(key);
    //         if (!collection) {
    //             await mp.set(key, [data]);
    //         } else {
    //             await collection.push(data);
    //         }

    //     }))
      //  const arr = Array.from(mp)
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json({success:true,  merch });
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,(req,res,next) => {
    req.statusCode=403;
    res.end('POST operation not supported ');
})
.put(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    // Merchs.findById(req.params.merchId)
    // .then((merch)=>{
    //     if(merch!=null){
    //         if(!merch.seller.equals(req.user._id)){
    //             var err = new Error('You are not authorized to update this merch info!');
    //             err.status = 403;
    //             return next(err);
    //         }
            Merchs.findByIdAndUpdate(req.params.merchId,
                 req.body
            ,{new:true})
            .then((merch)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success:true,merch}); 
            }
    //     }else{
    //         err= new Error('Merch' +req.params.merchId +'not found');
    //         err.status =404;
    //         return next(err);
    //     }
    // }
    ,(err) => next(err))
    .catch((err) =>next(err));
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Merchs.findById(req.params.merchId)
    .then((merch) => {
        if (merch != null) {
            Merchs.findByIdAndRemove(req.params.merchId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success:true,resp}); 
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else {
            err = new Error('Merch ' + req.params.merchId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

merchRouter.route('/:merchId/variants')
.options( (req, res) => {res.sendStatus(200); })
.get(authenticate.verifyUser,async(req,res,next)=>{
    Merchs.findById(req.params.merchId)
    .then((merch)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json({success:true,merch});
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,authenticate.verifyAdmin,async(req,res,next)=>{

    // Merchs.findByIdAndUpdate(req.params.merchId,{
    //     $addToSet:{'category.variants': req.body} 
    // },{new:true},function(err,result){
    //      if(err){
    //          res.send(err);
    //      }
    //     res.statusCode=200;
    //     res.setHeader('Content-Type','application/json');
    //     res.json({success:true,result});
    // },(err) => next(err))
    // .catch((err) => next(err));

    await Merchs.findOneAndUpdate(
        {
            _id:req.params.merchId,
             "category.variants.color":{
                 $ne : req.body.color
         }
    },
        { $addToSet: {
                    "category.variants":req.body
                }
        },
        {new:true}
    ).then((result) =>{
            res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json({success:true,result});
        
    },(err) => next(err))
    .catch((err) => next(err));


})
.put(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Merchs.findById(req.params.merchId)
    .then(async (merch) =>{
        //console.log(merch);
        colorIndex = await merch.category.variants.findIndex(obj =>obj.color == req.body.color);
        if(colorIndex  == -1 ){
                res.statusCode=404;
        res.setHeader('Content-Type','application/json');
         res.json({err : "Color does not exist"});
        }
        console.log(colorIndex);
        await Promise.all(req.body.stock.map(async (element)=>{
            stockIndex = await merch.category.variants[colorIndex].stock.findIndex(obj => obj.size == element.size );
            console.log(merch.category.variants[colorIndex].stock[stockIndex]);
            if(stockIndex == -1){
                merch.category.variants[colorIndex].stock.push(element);
            }else{
                merch.category.variants[colorIndex].stock[stockIndex].unitsInStock = element.unitsInStock;
            }
        })) 

        merch.save((err,result)=>{
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err});
                return ;
            }
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json({success:true,result});             
        })
    },(err) => next(err))
    .catch((err) => next(err));
    // Merchs.findOneAndUpdate(
    //     {
    //         _id:req.params.merchId,
    //         "category.variants":{
    //             $elemMatch :{
    //             "color": req.body.color
    //         }
    //     }},
    //     { $set: {
    //                 "category.variants.$[outer].stock": req.body.stock
    //             }
    //     },
    //     {
    //         "arrayFilters": [
    //             { "outer.color": req.body.color },
    //         ],
    //         upsert: false,
    //         new: true  
    //     }
    // ).then((result,err) =>{
    //     if (err) {
    //         console.log('Error updating service: ' + err);
    //         res.send({'error':'An error has occurred'});
    //     } else {
    //         res.statusCode=200;
    //     res.setHeader('Content-Type','application/json');
    //     res.json({success:true,result});
    //     }
    // },(err) => next(err))
    // .catch((err) => next(err));
});


// merchRouter.route('/:merchId/addVarientsImages')
// .options( (req, res) => {res.sendStatus(200); })
// .post(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
//     Merchs.findByIdAndUpdate(req.params.merchId,{
//         $set:{'category.variants': req.body} 
//     },{new:true},function(err,result){
//          if(err){
//              res.send(err);
//          }
//         res.statusCode=200;
//         res.setHeader('Content-Type','application/json');
//         res.json({success:true,result});
//     },(err) => next(err))
//     .catch((err) => next(err));
// })

merchRouter.route('/:merchId/setVisibility')
.options( (req, res) => {res.sendStatus(200); })
.post(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Merchs.findByIdAndUpdate(req.params.merchId,{
       $set:{'visibility' : req.body.visibility} 
    },{new:true},function(err,result){
        if(err){
            res.send(err);
        }
       res.statusCode=200;
       res.setHeader('Content-Type','application/json');
       res.json({success:true,result});
   },(err) => next(err))
   .catch((err) => next(err));
});


merchRouter.route('/:merchId/addTags')
.options( (req, res) => {res.sendStatus(200); })
.get(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Merchs.findById(req.params.merchId)
    .then((merch) =>{
        res.statusCode=200;
       res.setHeader('Content-Type','application/json');
       res.json({success:true,"tags": merch.tags });
    })
})
.post(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Merchs.findByIdAndUpdate(req.params.merchId,{
       $addToSet:{'tags' : req.body.tags} 
    },{new:true},function(err,result){
        if(err){
            res.send(err);
        }
       res.statusCode=200;
       res.setHeader('Content-Type','application/json');
       res.json({success:true,result});
   },(err) => next(err))
   .catch((err) => next(err));
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Merchs.findByIdAndUpdate(req.params.merchId,{
        $pullAll:{'tags' : req.body.tags} 
     },{new:true},function(err,result){
         if(err){
             res.send(err);
         }
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json({success:true,result});
    },(err) => next(err))
    .catch((err) => next(err));
});

merchRouter.route('/:merchId/cart')
.options( (req, res) => {res.sendStatus(200); })
.get(authenticate.verifyUser,(req,res,next)=>{
    Users.findById(req.user._id)
//    .populate('cart.merch')
    .then((user) =>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json({success:true,cart:user.cart});
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,(req,res,next)=>{
Merchs.findById(req.params.merchId)
    .then((merch) =>{
        Users.findByIdAndUpdate(req.user._id,{
            $push:{cart:{'color':req.body.color,'size':req.body.size,'units':req.body.units,'merch':req.params.merchId}
        }},{new:true},function(err,user){
            if(err){
                res.send(err);
            }
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json({success:true,cart:user.cart});
        });
        
    },(err) => next(err))
    .catch((err) => next(err));

});


merchRouter.route('/:merchId/checkCouponValidity')
.options( (req, res) => {res.sendStatus(200); })
.post(authenticate.verifyUser,async (req,res,next) =>{
    Merchs.findById(req.params.merchId)
    .then((merch) =>{
        Coupon.findOne({couponCode:req.body.couponCode})
        .then(async (coupon)=>{
           var intersection =  await coupon.tags.filter((tags) => merch.tags.indexOf(tags) !== -1);
           res.statusCode=200;
           res.setHeader('Content-Type','application/json');
           res.json({success:true,valid:`${intersection.length > 0? true:false }`});
        },(err) => next(err))
        .catch((err) => next(err));
    },(err) => next(err))
    .catch((err) => next(err));
})





/*merchRouter.route('/:merchId/buy')
.options( (req, res) => {res.sendStatus(200); })
.post(authenticate.verifyUser,(req,res,next)=>{
Merchs.findOneAndUpdate({_id:req.params.merchId,'category.variants':{$elemMatch:{
    "color":req.body.color,"size":req.body.size   
}}},{
    $inc:{'category.variants.$.unitsInStock':req.body.unitsInStock}
},{new:true},function(err,result){
         if(err){
             res.send(err);
         }
        Users.findByIdAndUpdate(req.user._id,{
            $push:{pastOrders:{'color':req.body.color,'size':req.body.size,'units':-1*req.body.unitsInStock,'merch':result}
        }},{new:true},function(err,user){
            if(err){
                res.send(err);
            }
        });
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json({success:true,result});
    },(err) => next(err))
    .catch((err) => next(err));

});*/

merchRouter.route('/:merchId/review')
.options((req, res) => { res.sendStatus(200); })
.get(authenticate.verifyUser, (req,res,next ) => {
    Merchs.findById(req.params.merchId)
    .then((merch)=> {
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json({success:true,review:merch.review});
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req,res,next) => {
    if(req.body != null){
        req.body.author = req.user._id;
        Merchs.findByIdAndUpdate(req.params.merchId,{
            $push:{'review':  req.body} 
        },{new:true})
        .then((result)=>{
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json({success:true,review:result.review});
        },(err) => next(err))
        .catch((err) => next(err));
    }
    else{
        err = new Error('Review not found in request body');
        err.status = 404;
        return next(err);
    }
})
.put( authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported ');
})
.delete(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported ');
});

merchRouter.route('/:merchId/review/:ratingId')
.options((req, res) => { res.sendStatus(200); })
.get(authenticate.verifyUser, (req,res,next) => {
    Merchs.findById(req.params.merchId)
    .then((merch) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:true,review:merch.review.id(req.params.ratingId)});
    }, (err) => next(err))
    .catch((err) => next(err));
    // Merchs.findOne({_id:req.params.merchId,'review._id':req.params.ratingId})
    // .populate({
    //     path: 'review',
    //     populate:{path:'author'}
    // })
    // .then((rating) => {
    //     res.statusCode = 200;
    //     res.setHeader('Content-Type', 'application/json');
    //     res.json({success:true, review:rating.review})
    // },(err) => next(err))
    // .catch((err) => next(err));
})
.post( authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on '+ req.params.merchId);
})
.put(authenticate.verifyUser, (req, res, next) => {
    data = {$set:{'review.$[cmnt].comment':req.body.comment,'review.$[cmnt].rating':req.body.rating}}
    filter = [{'cmnt._id':req.params.ratingId,'cmnt.author':req.user._id}]
    Merchs.findByIdAndUpdate(req.params.merchId,data,{arrayFilters:filter,new:true})
    .then((merch)=> {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:true,review:merch.review.id(req.params.ratingId)});
    },(err) => next(err))
     .catch((err) => next(err));
    // Merchs.findById(req.params.merchId)
    // .populate({
    //      path: 'review',
    //      populate:{path:'author'}
    //  })
    // .then((merch) => {
    //     if(merch != null){
    //         var comment = merch.review.id(req.params.ratingId);

    //         if(!comment.author.equals(req.user._id)){
    //             var err = new Error('You are not authorized to update this comment!');
    //             err.status = 403;
    //             return next(err);
    //         }

    //         comment.comment = req.body.comment;
    //         comment.rating = req.body.rating;


    //         merch.save((err,result) =>{
    //             if (err){
    //                 return next(err);   
    //             }
    //             res.statusCode = 200;
    //             res.setHeader('Content-Type', 'application/json');
    //             res.json({success:true,review:result.review});
    //         });
    //     }
    //     else {
    //         err = new Error('Comment ' + req.params.commentId + ' not found!');
    //         err.status = 404;
    //         return next(err);            
    //     }
    // }, (err) => next(err))
    // .catch((err) => next(err));
})
.delete( authenticate.verifyUser, (req, res, next) => {
    data = {$pull:{'review':{'_id':req.params.ratingId,'author':req.user._id}}}
  //  filter = [{'cmnt._id':req.params.ratingId,'cmnt.author._id':req.user._id}]
    Merchs.findByIdAndUpdate(req.params.merchId,data,{new:true})
    .then((merch)=> {
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:true,review:merch.review});
    },(err) => next(err))
     .catch((err) => next(err));
    // Merchs.findById(req.params.merchId)
    // .populate({
    //      path: 'review',
    //      populate:{path:'author'}
    //  })
    // .then((merch) => {
    //     if(merch != null){
    //         var comment = merch.review.id(req.params.ratingId);

    //         if(!comment.author.equals(req.user._id)){
    //             var err = new Error('You are not authorized to update this comment!');
    //             err.status = 403;
    //             return next(err);
    //         }

    //         comment.comment = req.body.comment;
    //         comment.rating = req.body.rating;


    //         merch.save((err,result) =>{
    //             if (err){
    //                 return next(err);   
    //             }
    //             res.statusCode = 200;
    //             res.setHeader('Content-Type', 'application/json');
    //             res.json({success:true,review:result.review});
    //         });
    //     }
    //     else {
    //         err = new Error('Comment ' + req.params.commentId + ' not found!');
    //         err.status = 404;
    //         return next(err);            
    //     }
    // }, (err) => next(err))
    // .catch((err) => next(err));
});



module.exports=merchRouter;
