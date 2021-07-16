const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//const Coupon = require('../models/couponModel')

const CouponRouter = express.Router();
var authenticate = require('../authenticate');
const Coupon = require('../models/couponModel');


CouponRouter.route('/')
.options( (req, res) => {res.sendStatus(200); })
.get(authenticate.verifyAdmin,(req,res,next) =>{
    Coupon.find({})
    .then((coupon) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json({success:true,coupon});
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyAdmin,(req,res,next) =>{
    Coupon.create(req.body)
    .then((coupon) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json({success:true,coupon});
    },(err) => next(err))
    .catch((err) => next(err));
});


CouponRouter.route('/:couponId')
.options( (req, res) => {res.sendStatus(200); })
.get(authenticate.verifyAdmin,(req,res,next) =>{
    Coupon.findById(req.params.couponId)
    .then((coupon) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json({success:true,coupon});
    },(err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyAdmin,(req,res,next) =>{
    Coupon.findByIdAndUpdate(req.params.couponId,req.body,{new:true})
    .then((coupon) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json({success:true,coupon});
    },(err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyAdmin,(req,res,next) => {
    Coupon.findByIdAndRemove(req.params.couponId)
    .then((coupon) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json({success:true,order});
    })
})


CouponRouter.route('/:couponId/addTags')
.options( (req, res) => {res.sendStatus(200); })
.get(authenticate.verifyAdmin,(req,res,next)=>{
    Coupon.findById(req.params.couponId)
    .then((coupon) =>{
        res.statusCode=200;
       res.setHeader('Content-Type','application/json');
       res.json({success:true,"tags": coupon.tags });
    })
})
.post(authenticate.verifyAdmin,(req,res,next)=>{
    Coupon.findByIdAndUpdate(req.params.couponId,{
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
.delete(authenticate.verifyAdmin,(req,res,next)=>{
    Coupon.findByIdAndUpdate(req.params.couponId,{
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


module.exports = CouponRouter;