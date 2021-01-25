const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const hbs  = require('express-handlebars');
const passport = require('passport');
const env = require('dotenv').config();
require('dotenv').config({path:'../src/.env'});

const app = express();

app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'main', layoutsDir: __dirname + '/views/layouts/' }));
app.set('view engine', 'hbs');

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET'
}));

//Import routes
const Users = require('./routes/users');

//Connect to database
mongoose.connect(process.env.DB_CONNECT,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    },
    () => {
        console.log('connected to db')
    });

//Route middlewares
app.use('/', Users);
app.use(express.json());
app.get('/', function(req, res) {
    res.render('auth', {layout: false});
});

//Setup serer
app.listen(3000, ()=>{
    console.log('Server is up and running');
})

// Passport setup

let userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.get('/success', (req, res) => res.render('success', { user: userProfile } ));
app.get('/error', (req, res) => res.send('Viga sisse logimisel'));

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
})

// Google auth

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback"
    },
    function (accessToken, refreshToken, profile, done) {
        userProfile = profile;
        return done(null, userProfile);
    }
));

app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));
app.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect: '/error'}),
    function (req, res) {
        // Successful authentification, redirect success
        res.redirect('/success');
});