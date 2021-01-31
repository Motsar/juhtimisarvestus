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
});

router.get('/', async (req, res, next) => {

    // Get user object from database
    //const company = await Company.findOne({ _id: req.companyId });

    // Get user's accounts
    //const balances = await Balance.find({ companyId: req.companyId });

    Company
        .find()
        .select('compName regNum address email phone vat yearLength Profit_report_schema additional_info')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                companies: docs.map(doc => {
                    return {
                        //id: doc.id,
                        compName: doc.compName,
                        regNum: doc.regNum,
                        address: doc.address,
                        email: doc.email,
                        phone: doc.phone,
                        vat: doc.vat,
                        yearLength: doc.yearLength,
                        Profit_report_schema: doc.Profit_report_schema,
                        //date: doc.date,
                        //balances: [balances]
                        additional_info: doc.additional_info
                    }
                })
            };
            if(docs.length > 0) {
                res.status(200).json(response);
            }
            else {
                res.status(200).json({
                    message: "Andmeid ei leitud"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
});

router.delete('/:companyId', (req, res, next) => {
    const id = req.params.companyId;

    Company
        .deleteOne({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Ettevõte on kustutatud"
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
});

module.exports = router;