const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const Merchs = require('../models/merch');
const Users = require('../models/user')
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

module.exports=uploadRouter;