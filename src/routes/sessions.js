const router = require('express').Router();
const {auth, notAuth} = require('../middlewares')
const passport = require('../config/passport.js');



router.get('/home',notAuth, (req, res)=> {
    return res.render('home', {layout:'dashboard'})
});



//Google auth

router.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

router.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect: '/error'}),
    function (req, res) {
        // Successful authentification, redirect success
        res.redirect('/home' );
    });

//Localauth

router.post('/auth/login',
    passport.authenticate('local', { successRedirect: '/home',
        failureRedirect: '/',
        failureFlash: true })
);

//Logout

router.get('/logout', auth,function(req, res){
    req.logout();
    res.redirect('/');
});


module.exports = router;


