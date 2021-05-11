const router = require('express').Router();
const {auth} = require('../middlewares');

router.get('/',auth, (req,res)=>{
    res.render('instructions', {email: req.user.email, user:req.user})
})

module.exports = router;