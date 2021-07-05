var express = require('express');
const bodyParser=require('body-parser');
const mongoose = require('mongoose');
var Merch=require('../models/merchModel');

const searchRouter = express.Router();
var authenticate = require('../authenticate');

searchRouter.use(express.json());


const elasticsearch = require('@elastic/elasticsearch');
const { createConnector } = require('aws-elasticsearch-js');

const region = 'ap-south-1';
const domain = 'https://search-products-75oijr7pifyosozzgptji3ynbu.ap-south-1.es.amazonaws.com/';
var AWS= require('aws-sdk');
const key = process.env.S3_KEY;
const secret = process.env.S3_SECRET ;

const getCreds = cb => {
    // load creds from somewhere...
    const credentials = new AWS.Credentials(process.env.S3_KEY, process.env.S3_SECRET);
    // or credentials = { sessionToken }
    const err = null; // if you give an error, the request will abort
    cb(err, credentials);
  };
  
const client = new elasticsearch.Client({
  nodes: [ domain ],
  Connection: createConnector({ region, getCreds })
});





searchRouter.route('/')
.get(authenticate.verifyUser,(req,res,next) =>{
    console.log(key);
    client.search({
        index: 'merchs',
        body: {
          query: {
            bool:{
                must:[
                  {match:{"name":"fdsaf"}},
                  {match:{"description":"adsfasfsdafsdf"}}
                  ]
              }
          }
        }
      }, (err, result) => {
        if (err) console.log(err)
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:true,result});
      })
})



module.exports=searchRouter;