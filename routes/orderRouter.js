const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Orders = require('../models/orderModel');
const Users = require('../models/userModel')
const crypto = require('crypto');
const Merchs = require('../models/merchModel');

const orderRouter = express.Router();
var authenticate = require('../authenticate');

const Razorpay = require('razorpay')
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
})



orderRouter.route('/')
.options( (req, res) => {res.sendStatus(200); })
.get(authenticate.verifyUser,(req,res,next)=>{
    Orders.find({user: req.user._id})
    .then((order) =>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json({success:true,order});
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,async (req,res,next)=>{
    if(req.body != null){
        var merchs=[]
        totalPrice =0;
        for(i=0;i<req.body.orderItems.length;i++){
            await Merchs.findById(req.body.orderItems[i].mrch)
            .then((merch)=>{
                let obj= {
                    "merch": merch,
                    "color": req.body.orderItems[i].color,
                    "size": req.body.orderItems[i].size,
                    "units": req.body.orderItems[i].units
            }
            merchs.push(obj);
            totalPrice+=merch.originalPrice;
        },(err) => next(err))
        .catch((err) => next(err));
        }
        const order={
  //      seller: req.body.orderItems[0].seller,
        orderItems: merchs,
        shippingAddress: req.body.shippingAddress,
//        paymentMethod: req.body.paymentMethod,
//        itemsPrice: req.body.itemsPrice,
//        shippingPrice: req.body.shippingPrice,
//        taxPrice: req.body.taxPrice,
        totalPrice: totalPrice,
        user: req.user._id,
        }
        await Orders.create(order)
        .then((finalOrder)=>{


            Users.findById(req.user._id)
            .then((user) => {
                user.order=finalOrder._id;
            })
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success:true,finalOrder});
        },(err) => next(err))
        .catch((err) => next(err));

    }else{
        err = new Error('Order info not found in request body');
        err.status = 404;
        return next(err);
    }
})

orderRouter.post("/success", async (req, res) => {

    try {
        // getting the details back from our font-end
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = req.body;

        // Creating our own digest
        // The format should be like this:
        // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
        const shasum = crypto.createHmac('sha256', 'C1C8w91aHLpeLuw3Qnt6MbjM');

        shasum.update(req.body.orderCreationId+"|"+ req.body.razorpayPaymentId);

        const digest = shasum.digest("hex");

        // comaparing our digest with the actual signature
        if (digest !== razorpaySignature)
            return res.status(400).json({ msg: "Transaction not legit!" });

        // THE PAYMENT IS LEGIT & VERIFIED
        // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

        res.json({
            msg: "success",
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

orderRouter.route('/:orderId')
.post( async(req,res,next) =>{

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        var instance = new Razorpay({
            key_id: 'rzp_test_8DyECyhlXZaLyx',
            key_secret: 'C1C8w91aHLpeLuw3Qnt6MbjM'
          })

        const orderCheckout = await Orders.findById(req.params.orderId).session(session);

          const totalPrice = orderCheckout.totalPrice;

        orderCheckout.orderItems.forEach(async element => {
            const merchs=await Merchs.findOneAndUpdate({_id:element._id ,'category.variants':{$elemMatch:{
                "color":req.body.color,"size":req.body.size   
            }}},{
                $inc:{'category.variants.$.unitsInStock':-1*req.body.unitsInStock}
            },{new:true});
            totalPrice +=merchs.originalPrice;
        });

        const options = {
            amount: totalPrice, // amount in smallest currency unit
            currency: "INR",
            receipt: req.params.orderId,
        };

        const order = await instance.orders.create(options);


        if (!order) return res.status(500).send("Some error occured");

        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
})

/*orderRouter.route('/:id')
.options( (req, res) => {res.sendStatus(200); })
.get(authenticate.verifyUser,(req,res,next) =>{
    Orders.findById(req.param.id)
    .then((order)=>{
        if(order.user!=req.user._id){
            var err = new Error('You are not authorized to see this order');
            err.status = 403;
            return next(err);
        }
        res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success:true,finalOrder});
    },(err) => next(err))
    .catch((err) => next(err))
})
.delete(authenticate.verifyUser,(req,res,next) => {
    Orders.findById(req.param.id)
    .then((order)=>{
        if(order.user!=req.user._id){
            var err = new Error('You are not authorized to see this order');
            err.status = 403;
            return next(err);
        }
            Orders.findByIdAndRemove(req.params.id)
            .then((delOrder) => {
            res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(delOrder);
            }) 
    },(err) => next(err))
    .catch((err) => next(err))
})*/



module.exports=orderRouter;