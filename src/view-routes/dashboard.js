const router = require('express').Router();
const {auth} = require('../middlewares');

router.get('/', auth , (req, res)=>{
    res.render('home', {email: req.email});
});

module.exports = router;