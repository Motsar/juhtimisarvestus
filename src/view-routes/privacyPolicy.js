const router = require('express').Router();
const {auth} = require('../middlewares');

router.get('/', (req,res)=>{
    res.render('privacyPolicy', {layout: false})
})

module.exports = router;