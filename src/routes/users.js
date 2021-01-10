const bcrypt = require('bcryptjs');
const router = require('express').Router();
const User = require('../models/User')

router.post('/users',async(req,res) => {
    console.log(req.body)
    //Checking if the user is already in database
    const emailExists = await User.findOne({email: req.body.email});
    if(emailExists) return res.status(401).json({error: "Email already exists!"});

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

module.exports = router;