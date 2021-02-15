const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Merchs = require('../models/merch');

const merchRouter = express.Router();
var authenticate = require('../authenticate');

merchRouter.use(bodyParser.json());


merchRouter.route('/addMerch')
.options( (req, res) => {res.sendStatus(200); })
.post(authenticate.verifyUser,authenticate.verifySeller, (req, res, next) => {
    if(req.body != null)
    {
        Merchs.create(req.body)
        .then((merch)=>{
            res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success:true,merch});
        })
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

merchRouter.route('/:merchId')
.options( (req, res) => {res.sendStatus(200); })
.get(authenticate.verifyUser,authenticate.verifySeller,(req,res,next)=>{
    Merchs.findById(req.params.merchId)
    .populate(users)
    .then((merch) =>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json({success:true,merch});
    },(err) => next(err))
    .catch((err) => next(err));
})
.post((req,res,next) => {
    req.statusCode=403;
    res.end('POST operation not supported ');
})
.put((req,res,next)=>{
    Merchs.findById(merchId)
    .populate(seller)
    .then((merch)=>{
        if(merch!=null){
            if(merch.seller.equals(req.user._id)){
                var err = new Error('You are not authorized to update this merch info!');
                err.status = 403;
                return next(err);
            }
            Merchs.findByIdAndUpdate(req.param.merchId,{
                $set: req.body
            },{new:true})
            .then((merch)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success:true,merch}); 
            })
        }else{
            err= new Error('Merch' +req.params.merchId +'not found');
            err.status =404;
            return next(err);
        }
    }
    ,(err) => next(err))
    .catch((err) =>next(err));
})
.delete(authenticate.verifyUser,authenticate.verifySeller, (req,res,next) => {
    Merchs.findById(req.params.merchId)
    .then((merch) => {
        if (merch != null) {
            Merchs.findByIdAndRemove(req.params.merchId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp); 
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

merchRouter.route('/:merchId/addVarients')
.options( (req, res) => {res.sendStatus(200); })
.post(authenticate.verifyUser,authenticate.verifySeller,(req,res,next)=>{
    Merchs.findByIdAndUpdate(req.params.merchId,{
        $push: {category: { variants : req.body}}
    },{new:true})
    .then((merch) =>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json({success:true,merch});
    },(err) => next(err))
    .catch((err) => next(err));
})

module.exports=merchRouter;