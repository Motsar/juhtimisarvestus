const router = require('express').Router();
const {auth} = require('../middlewares');
const User = require('../models/User')


router.get('/',auth, async(req,res)=>{
    if(req.admin){
        let users= await User.find({ _id: {$ne: req.userId}}).lean();
        res.render('settings',{
            users: users, 
            admin: req.admin,
            email: req.user.email,
            user:req.user
            })    
    }else{
        res.render('settings',{user:req.user,email: req.user.email})
    }
})

module.exports = router;