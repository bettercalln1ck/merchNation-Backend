var passport=require('passport');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
var LocalStrategy=require('passport-local').Strategy;
var User=require('./models/userModel');
var JwtStrategy=require('passport-jwt').Strategy;
var ExtractJwt= require('passport-jwt').ExtractJwt;
var jwt=require('jsonwebtoken');

var config=require('./config');



passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true,
},async(req,accessToken,refreshToken,profile,next) =>{

    const defaultUser = {
        firstName : `${profile.name.givenName}`,
        username  :  profile.emails[0].value,
        picture   :  profile.photos[0].value,
        googleId  :  profile.id,
    }

    console.log(profile.photos[0].value);
    const user = await User.findOneAndUpdate(
        { googleId : req.googleId},
        {
            $setOnInsert : defaultUser
        },
        {
            new:true,
            upsert:true
        }
    ).catch((err) =>{
        next(err,null);
    });

    if(user && user[0])
    return next(null, user && user[0]);

}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
