const router = require('express').Router();
const {auth} = require('../middlewares');

router.get('/',auth, (req,res)=>{
    res.render('newReport', {email: req.user.email})
})

module.exports = router;