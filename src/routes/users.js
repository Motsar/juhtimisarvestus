const router = require('express').Router();
const User = require('../models/User')
const balance = require('../models/Balance');
const profitReport = require('../models/ProfitReport');
const Company = require('../models/Company');
const breakEvenAnalysis = require('../models/BreakEvenAnalysis');
const bcrypt = require('bcryptjs');
const { apiAuth, cleanBody, expire } = require('../middlewares');

router.post('/',cleanBody,async(req,res) => {

    //Checking if the user is already in database
    const emailExists = await User.findOne({email: req.body.email});
    if(emailExists) return res.status(401).json({error: "Vastav e-mail on juba olemas."});

    //Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    
    let d = new Date();
    let year = d.getFullYear();
    let month = d.getMonth();
    let day = d.getDate();
    let expire = new Date(year + 1, month, day);


    //Create a new user

    
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
        expiry_date: expire
    });

    try{
        await user.save();
        res.status(201).json({user: user._id});
    }catch(err){
        res.status(500).json({error:err});
    }

})

//Change email or user type

router.patch('/',apiAuth, cleanBody, async(req,res)=>{

    let userId;
    let updateMessage;
    let updateData;

    if(req.body.length===0)  return res.status(401).json({error: "Päring ei tohi olla tühi"});

    if(!req.body.type) return res.status(401).json({error: "Päringu tüüp on puudu"});

    if(req.body.type==="1"){
        if(!req.body.password) return res.status(401).json({error:"Parooli pole edastatud"});
        //Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        userId=req.userId;
        updateData = {password:hashedPassword};
        updateMessage =" Parool on vahetatud";
    }else if(req.body.type==="2"){
        if(req.admin===false) return res.status(401).json({error:"Kasutajal puuduvad õigused administraatori määramiseks"});
        if(!req.body.email) return res.status(401).json({error:"Sisestage kasutaja email"});
        let user = await User.findOne({email:req.body.email});
        if(!user) return res.status(401).json({error:"Sellise meili aadressiga kasutajat ei leitud"});
        userId = user._id
        updateData = {admin:true};
        updateMessage = "Kasutajale anti administraatori õigused";
    }
    let findUser = await User.findOne({_id:userId});
    if(!findUser) return res.status(401).json({error:"Sellise id-ga kasutajat ei leitud"});

    try {
        await findUser.updateOne(updateData);
        return res.status(201).json({message : updateMessage});
    } catch (e) {
        res.status(401).json({error: e});
    }



})

//Delete user account and related documents route

router.delete('/',apiAuth,cleanBody, async(req,res)=>{

    //Check if request body is not empty 

    if(!req.body.user_id) return res.status(401).json({error: "Kasutaja id puudub"})

    //Check if user exists

    let findUser = await User.findOne({_id:req.body.user_id});
    if(!findUser) return res.status(401).json({error: "Sellise id-ga kasutajat ei eksisteeri"})


    if(req.userId === req.body.user_id){
        let comIdArray=[];
        let findCompDocs = await Company.find({user_id:req.body.user_id})
           
        try {

            //check if user has documents and delete those

            if(findCompDocs.length>=1){

                findCompDocs.forEach(compDoc => {
                    comIdArray.push(compDoc._id)
                });
                //find and delete user related documents
    
                comIdArray.forEach(async compId => {
                    await balance.findOneAndDelete({_id:compId})
                    await profitReport.findOneAndDelete({_id:compId})
                    await breakEvenAnalysis.findOneAndDelete({_id:compId})
                    await Company.findOneAndDelete({_id:compId})
                });
            }

            await User.findOneAndDelete({_id:req.body.user_id})

            res.status(200).json({message:"Kasutaja konto on kustutatud"})

        } catch (e) {
            res.status(500).json({error:e})
        }
    }else{

        //check if user is admin to have permission to delete other users

        if(!req.admin) return res.status(401).json({error: "Kasutajal puuduvad õigused kustutamiseks"})
        
        let comIdArray=[];

        //Find user related documents
        
        let findCompDocs = await Company.find({user_id:req.body.user_id})
            
        try {
            
            //check if user has documents and delete those

            if(findCompDocs.length>=1){

                findCompDocs.forEach(compDoc => {
                    comIdArray.push(compDoc._id)
                });
                //find and delete user related documents
    
                comIdArray.forEach(async compId => {
                    await balance.findOneAndDelete({_id:compId})
                    await profitReport.findOneAndDelete({_id:compId})
                    await breakEvenAnalysis.findOneAndDelete({_id:compId})
                    await Company.findOneAndDelete({_id:compId})
                });
            }

            //delete user

            await User.findOneAndDelete({_id:req.body.user_id})

            res.status(200).json({message:"Kasutaja konto on kustutatud"})

        } catch (e) {
            res.status(500).json({error:e})
        }
    }

})

module.exports = router;