var express = require('express');
const bodyParser=require('body-parser');
var User=require('../models/userModel');
var router = express.Router();
var passport=require('passport');
var authenticate=require('../authenticate');
var uniqueValidator = require('mongoose-unique-validator');
var nodemailer = require('./services/nodemailer.config');
const { route } = require('./uploadRouter');
const { getMaxListeners } = require('../models/userModel');
//const cors = require('./cors');


router.get('/testMail' ,(req,res,next)=>{
  nodemailer.sendConfirmationEmail(
    "nikhil",
    "yegamo3406@zevars.com",
    123
  );
  res.json("send");
})

router.route('/verifyToken')
.get(authenticate.verifyUser,(req, res, next)=> {
  User.findById(req.user._id)
  .then((user) =>{
  res.statusCode=200;
  res.setHeader('Content-Type','application/json');
  res.json({success: true,userId:user._id,username:user.username,firstname: user.firstname,lastname: user.lastname});
  },(err) =>{
    res.redirect('/logout');
    next(err)})
  .catch((err) => next(err));
});

// router.route('/becomeSeller')
// .get(authenticate.verifyUser,(req, res, next)=> {
//   User.findByIdAndUpdate(req.user._id,{
//     $set: {"seller":"true"} },{new: true})
// 	.then((user) =>{
// 	res.statusCode=200;
// 	res.setHeader('Content-Type','application/json');
// 	res.json(user);
// 	},(err) =>next(err))
// 	.catch((err) => next(err));
// });

router.route('/')
.get(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next)=> {
  User.find({})
	.then((user) =>{
	res.statusCode=200;
	res.setHeader('Content-Type','application/json');
	res.json({success: true,user});
	},(err) =>next(err))
	.catch((err) => next(err));
});

router.route('/profile')
.get(authenticate.verifyUser,(req, res, next)=> {
  User.findById(req.user._id)
  .populate('pastOrders.merch')
  .populate('cart.merch')
  .then((user) =>{
      res.statusCode=200;
      res.setHeader('Content-Type', 'application/json');
        res.json({success: true,user});
  },(err) => next(err))
    .catch((err) =>next(err));
})
.put( authenticate.verifyUser, (req,res,next) => {
    User.findById(req.user._id)
    .then((user) => {
        if (user != null) {
            User.findByIdAndUpdate(req.user._id, 
              {$set:req.body

          },{ new: true })
            .then((user) => {
                User.findById(req.user._id)
                .then((user) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success:true,user}); 
                })               
            }, (err) => next(err));
        }
        else {
            err = new Error('User ' + req.user._id+ ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

router.route('/cart')
.options((req, res) => { res.sendStatus(200); })
.get(authenticate.verifyUser, (req,res,next) =>{
  User.findById(req.user._id)
    .populate('cart.merch')
    .then((user) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success:true,cart:user.cart}); 

    }, (err) => next(err))
    .catch((err) => next(err));
})

router.route('/makeAdmin')
.options((req, res) => { res.sendStatus(200); })
.get(authenticate.verifyUser, (req,res,next) =>{
  User.findByIdAndUpdate(req.user._id,{admin:true})
    .then((user) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success:true,user:user}); 

    }, (err) => next(err))
    .catch((err) => next(err));
})

router.route('/pastOrders')
.options((req, res) => { res.sendStatus(200); })
.get(authenticate.verifyUser, (req,res,next) =>{
  User.findById(req.user._id)
    .populate('pastOrders.merch')
    .then((user) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success:true,pastOrders: pastOrders.product}); 

    }, (err) => next(err))
    .catch((err) => next(err));
})


router.post('/signup',async (req, res, next) => {
  User.register(new User({username: req.body.username,firstName: req.body.firstName,phoneNumber : req.body.phoneNumber}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      if (req.body.lastName)
        user.lastName = req.body.lastName;

              const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
              let token = '';
              for (let i = 0; i < 25; i++) {
                    token += characters[Math.floor(Math.random() * characters.length )];
                  }

      user.confirmationCode=token; 


       user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err});
          return ;
        }

        var err ;
           
          try{
          nodemailer.sendConfirmationEmail(
            user.firstName,
            req.body.username,
            user.confirmationCode
          );
          }catch (error){
              err =error
          }


        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true,user,status: 'User was registered successfully! Please check your email',error: err});
        });

     
      });
    }
  });
});

router.get('/confirm/:confirmationCode',(req,res,next) => {
  User.findOneAndUpdate({confirmationCode : req.params.confirmationCode},
   { status :'Active'})
  .then((user) => {
    console.log(user);
    user.status = 'Active';
    
    user.save((err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err});
        return ;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success:true , status: "Your account has been confirmed"})
    });

} , (err) => next(err))
  .catch((err) => next(err));;
});


router.post('/login',(req,res,next) =>{
      passport.authenticate('local')(req,res,() =>{
			var token=authenticate.getToken({_id:req.user._id});
			res.statusCode=200;		
			res.setHeader('Content-Type','application/json');
			res.json({success: true,userId:req.user._id,token:token,status:'You are successfully login!'});
    });
});


router.get('/logout',(req,res) =>{
	if(req.session){
		req.session.destroy();
		res.clearCookie('session-id');
    res.statusCode = 200;
  res.json({success: true,status: 'Successfully log out!'});

	}
	else{
    res.clearCookie('session-id');
		var err =new Error('You are not logged in');
		err.status =403;
		next(err);
	}

});

module.exports = router;
