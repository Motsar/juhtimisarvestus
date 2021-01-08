const mongoose = require('mongoose');
const router = require('express').Router();

router.post('/users',async(req,res) => {
    //Checking if the user is already in database
    const emailExists = await User.findOne({email: req.body.email});
    if(emailExists) return res.status(401).json({error: "Email allready exists!"});
})

module.exports = router;