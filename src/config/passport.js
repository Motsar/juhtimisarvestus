const User = require('../models/User');
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
                userProfile = JSON.stringify(currentUser);
                console.log(currentUser);
                done(null, userProfile);
            } else{
                //if not, create a new user
                new User({
                    firstName:  profile.name.givenName,
                    lastName: profile.name.familyName,
                    googleId:   profile.id,
                    email: profile.emails[0].value
                }).save().then((newUser) =>{
                    userProfile=JSON.stringify(newUser);;
                    done(null, userProfile);
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
        User.findOne({ email: username }, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (user.password!==password) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            userProfile = JSON.stringify(user);;
            return done(null, userProfile);
        });
    },
));

module.exports = passport;