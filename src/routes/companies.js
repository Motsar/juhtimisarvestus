const router = require('express').Router();
const Company = require('../models/Company');
const {apiAuth} = require('../middlewares');

//post and save company data to database

router.post('/',apiAuth, async (req, res)=>{

    //Checking if the company is already in database

    const compExists = await Company.findOne({compName: req.body.compName});
    if(compExists) return res.status(401).json({"error": "analysis with this company name already exists!"});

    let useridJSON= JSON.parse(req.user);

    let email= req.body.email
    //create a new user
    const company = new Company({
        user_id: req.userId,
        compName: req.body.compName,
        regNum: req.body.regNum,
        address: req.body.address,
        email: email.toLowerCase(),
        phone: req.body.phone,
        vat_obligatory: req.body.vat_obligatory,
        yearLength: req.body.yearLength,
        Profit_report_schema: req.body.Profit_report_schema,
        additional_info: req.body.additional_info,
    });

    try{
        const saveCompany = await company.save();
        res.status(201).json(company);
    }catch(err){
        res.json({error:err});
    }
})

module.exports = router;