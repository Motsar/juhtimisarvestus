const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport')
    , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
    , LocalStrategy = require('passport-local').Strategy;



//google auth strategy

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback"
    }, (accessToken, refreshToken, profile, done) => {
        // passport callback function
        //check if user already exists in our db with the given profile ID
        User.findOne({googleId: profile.id}).then((currentUser)=>{
            if(currentUser){
                //if we already have a record with the given profile ID
                
                done(null, currentUser);
            } else{
                //if not, create a new user
                new User({
                    firstName:  profile.name.givenName,
                    lastName: profile.name.familyName,
                    googleId:   profile.id,
                    email: profile.emails[0].value
                }).save().then((newUser) =>{
                    done(null, newUser);
                });
            }
        })
    })
);

//local auth

passport.use('local',new LocalStrategy({
        usernameField: 'email',
        passwordField : 'password'
    },
    function(username, password, done) {
        User.findOne({ email: username }, async function(err, user) {
            if (err) { return done(err);}
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (await bcrypt.compare(password, user.password)===false){
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    },
));


module.exports.userProfile;
module.exports = passport;