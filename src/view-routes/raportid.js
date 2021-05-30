const router = require('express').Router();
const Company = require('../models/Company');
const {auth} = require('../middlewares');

router.get('/',auth, async(req,res)=>{
    let userCompanies = await Company.find({ user_id: req.userId }).select(
        '_id compName regNum address email phone vat yearLength Profit_report_schema additional_info analyse_date').lean().exec();
    let data = !userCompanies? { error: true, message:"Kasutajal pole ettevõttega seotud dokumente. Alusta uue analüüsi koostamist." }:userCompanies;
    res.render('raportid',{
        email: req.user.email, 
        data: data
        })
})

module.exports = router;