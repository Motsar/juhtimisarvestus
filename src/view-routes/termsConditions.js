const router = require('express').Router();
const {auth} = require('../middlewares');

router.get('/', (req,res)=>{
    res.render('terms', {layout: false})
})

module.exports = router;