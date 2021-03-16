const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Orders = require('../models/orderModel');
const Users = require('../models/user')

const orderRouter = express.Router();
var authenticate = require('../authenticate');


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
.post(authenticate.verifyUser,(req,res,next)=>{
    if(req.body != null){
        const order={
        seller: req.body.orderItems[0].seller,
        orderItems: req.body.orderItems,
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        itemsPrice: req.body.itemsPrice,
        shippingPrice: req.body.shippingPrice,
        taxPrice: req.body.taxPrice,
        totalPrice: req.body.totalPrice,
        user: req.user._id,
        }
        Orders.create(order)
        .then((finalOrder)=>{
            res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success:true,finalOrder});
        })

    }else{
        err = new Error('Order info not found in request body');
        err.status = 404;
        return next(err);
    }
})
