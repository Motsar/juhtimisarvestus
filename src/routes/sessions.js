const router = require('express').Router();
const {auth} = require('../middlewares')
const passport = require('../config/passport.js');


//Google auth

router.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

router.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect: '/error'}),
    function (req, res) {
        // Successful authentification, redirect success
        res.redirect('/avaleht' );
    });

//Localauth

router.post('/auth/login',
    passport.authenticate('local', { successRedirect: '/avaleht',
        failureRedirect: '/',
        failureFlash: true })
);


//Logout

router.get('/logout', auth,function(req, res){
    req.logout();
    res.redirect('/');
});


module.exports = router;


