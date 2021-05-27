const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const Merchs = require('../models/merchModel');
const Users = require('../models/userModel')
var path = require('path');


const upload=require('./services/file-upload')

const singleUpload = upload.single('image');

const uploadRouter=express.Router();


uploadRouter.route('/userImageUpload')
.post(authenticate.verifyUser,function(req,res,next) {

    singleUpload(req,res,(err) =>{
        if(err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: err});
          }
        Users.findByIdAndUpdate(req.user._id,{
            $set:{picture:req.file.location}},{new:true})
        .then((user)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({'imageUrl':req.file.location});
        }, (err) => next(err))
        .catch((err) => next(err));
    })

});



uploadRouter.route('/adminImageUpload')
.post(authenticate.verifyUser,authenticate.verifyAdmin,function(req,res,next) {

    singleUpload(req,res,(err) =>{
        if(err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: err});
          }
        Users.findByIdAndUpdate(req.user._id,{
            $push:{'adminInfo.pictures':req.file.location}},{new:true})
        .then((merch)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({'imageUrl':req.file.location,'merch':merch});
        }, (err) => next(err))
        .catch((err) => next(err));
    })

});

uploadRouter.route('/:merchId/merchImageUpload')
.post(authenticate.verifyUser,function(req,res,next) {

    singleUpload(req,res,(err) =>{
        if(err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: err});
          }
          erchs.findOneAndUpdate(
            {
                _id:req.params.merchId,
                "category.variants":{
                    $elemMatch :{
                    "color": req.body.color
                }
            }},
            { $set: {
                        "category.variants.$[outer].images":req.body.images
                    }
            },
            {
                "arrayFilters": [
                    { "outer.color": req.body.color },
                ]  
            }
        ).then((result,err) =>{
            if (err) {
                console.log('Error updating service: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                // console.log('' + result + ' document(s) updated');
                res.send(result);
            }
        })
    })

});


module.exports=uploadRouter;