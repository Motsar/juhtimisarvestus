const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config('../.env');
const passport = require('passport')
    , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
    , LocalStrategy = require('passport-local').Strategy;



//google authentication strategy

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.DEVELOPEMENT=="true"?"http://localhost:3000/auth/google/callback":process.env.CALLBACKURL
    }, (accessToken, refreshToken, profile, done) => {
        // passport callback function
        //check if user already exists in our db with the given profile ID
        User.findOne({googleId: profile.id}).then((currentUser)=>{
            if(currentUser){
                //if we already have a record with the given profile ID
                
                done(null, currentUser);
            } else{

                let d = new Date();
                let year = d.getFullYear();
                let month = d.getMonth();
                let day = d.getDate();
                let expire = new Date(year + 1, month, day);

                //if not, create a new user
                new User({
                    firstName:  profile.name.givenName,
                    lastName: profile.name.familyName,
                    googleId:   profile.id,
                    email: profile.emails[0].value,
                    user_type: "user",
                    expiry_date : expire
                }).save().then((newUser) =>{
                    done(null, newUser);
                });
            }
        })
    })
);

//Local authentication

passport.use('local',new LocalStrategy({
        usernameField: 'email',
        passwordField : 'password'
    },
    function(username, password, done) {
        User.findOne({ email: username }, async function(err, user) {
            try {
                if (err) { return done(err);}
                if (!user) {
                    return done(null, false, { message: 'Vale e-posti aadress!' });
                }
                if (await bcrypt.compare(password, user.password)===false){
                    return done(null, false, { message: 'Vale parool!' });
                }
                return done(null, user);
            } catch (e) {
                return done(null, false, { message: e });
            }
            
        });
    },
));


module.exports.userProfile;
module.exports = passport;