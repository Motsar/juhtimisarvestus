const router = require('express').Router();
const Company = require('../models/Company');
const {apiAuth} = require('../middlewares');
const balance = require('../models/Balance');
const profitReport = require('../models/ProfitReport');

//post and save company data to database

router.post('/',apiAuth, async (req, res)=>{

    //Checking if the company is already in database

    const compExists = await Company.findOne({compName: req.body.compName, user_id:req.userId});
    if(compExists) return res.status(401).json({"error": "Sellise nimega ettevõte on juba olemas."});

    let email= req.body.comp_email

    //create a new user

    const company = new Company({
        user_id: req.userId,
        compName: req.body.compName,
        regNum: req.body.regNum,
        address: req.body.address,
        comp_email: email.toLowerCase(),
        phone: req.body.phone,
        vat_obligatory: req.body.vat_obligatory,
        yearLength: req.body.yearLength,
        Profit_report_schema: req.body.Profit_report_schema,
        additional_info: req.body.additional_info,
    });

    try{
        const savedCompany = await company.save();
        const newBalance = new balance({_id: savedCompany._id,});
        const newProfitReport = new profitReport({_id: savedCompany._id});
        await newBalance.save();
        await newProfitReport.save();
        res.status(201).json(company);
    }catch(err){
        console.log(err)
        res.json({error:err});
    }
})

router.get('/', apiAuth ,async (req, res, next) => {

    // Get company documents that belong to user

    let userCompanies = await Company.find({user_id:req.userId}).select('_id compName regNum address email phone vat yearLength Profit_report_schema additional_info analyse_date').exec();
    if(!userCompanies) return res.status(404).json({error: "Kasutajal pole ettevõttega seotud dokumente. Alusta uue analüüsi koostamist."});

    // Send companies object, if error send error message

    try{
        res.status(200).json({
            companies: userCompanies
        })
    }catch(err){
        res.status(500).json({error:err})
    }

});

//Update company document

router.patch('/',apiAuth,async (req, res) => {

    //error handling

    if(Object.keys(req.body).length===0) return res.status(400).json({error:"Uuendamiseks sisesta andmed."});
    let id = req.body.company_id;
    if(!id)return res.status(404).json({error:"Ettevõtte ID puudub."});
    let company = await Company.findOne({_id: id, user_id:req.userId});
    if(!company) return res.status(401).json({error:"Ettevõttega seotud analüüse ei leitud."});
})

//Delete analysis

router.delete('/',apiAuth , async (req, res) => {

    // Check if user has delete document in database

    let id = req.body.company_id;
    if(!id)return res.status(404).json({error:"Ettevõtte ID puudub."});
    let company = await Company.findOne({_id: id, user_id:req.userId});
    if(!company) return res.status(401).json({error:"Ettevõttega seotud analüüse ei leitud."})

    // Delete document, if error send error message

    try{
        const deleteAnalysis = await Company.deleteOne({_id:company._id})
        res.status(201).json({success: "Ettevõttage seotud analüüs on kustutatud."})
    }catch(err){
        res.status(401).json({error: err});
    }

});


module.exports = router;