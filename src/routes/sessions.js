const router = require('express').Router();
const {auth} = require('../middlewares')
const passport = require('../config/passport.js');


//global variable for DEVELOPMENT ONLY

global.userProfile;

//Success redirect DEVELOPMENT ONLY

router.get('/success', auth, (req, res)=> {
    return res.render('success', {user:JSON.parse(userProfile)});
});

//Google auth

router.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

router.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect: '/error'}),
    function (req, res) {
        // Successful authentification, redirect success
        res.redirect('/success' );
    });

//Localauth

router.post('/auth/login',
    passport.authenticate('local', { successRedirect: '/success',
        failureRedirect: '/',
        failureFlash: true })
);

//Logout

router.get('/logout', auth,function(req, res){
    req.logout();
    res.redirect('/');
});


module.exports = router;


