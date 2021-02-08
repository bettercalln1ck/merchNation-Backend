const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Merchs = require('../models/merch');

const merchRouter = express.Router();
var authenticate = require('../authenticate');

merchRouter.use(bodyParser.json());

merchRouter.use('/merch',merchRouter);

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

merchRouter.route('./:merchId')
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

});



module.exports=merchRouter;