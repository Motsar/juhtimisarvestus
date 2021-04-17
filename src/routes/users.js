const bcrypt = require('bcryptjs');
const { apiAuth } = require('../middlewares');
const router = require('express').Router();
const User = require('../models/User')

router.post('/',async(req,res) => {
    console.log(req.body)
    //Checking if the user is already in database
    const emailExists = await User.findOne({email: req.body.email});
    if(emailExists) return res.status(401).json({error: "Vastav e-mail on juba olemas."});

    //Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //create a new user
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword
    });


    try{
        const savedUser = await user.save();
        res.status(201).json({user: user._id});
    }catch(err){
        res.json({error:err});
    }

})

router.get('/',apiAuth,async(req,res)=>{
    let userData= await User.findOne({_id:req.userId})
    if(!userData) return res.status(401).json({error:"cant find user"})
    return res.status(200).json({email:userData.email})
})

module.exports = router;