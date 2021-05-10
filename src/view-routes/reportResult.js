const router = require('express').Router();
const Company = require('../models/Company');
const {auth} = require('../middlewares');

router.get('/',auth, async(req,res)=>{
    let company_id = req.query.dokument
    try{
        let userCompany = await Company.findOne({ _id:company_id,user_id: req.userId }).lean();
        let vatObl = userCompany.vat_obligatory==="yes"?"Jah":"Ei";
        res.render('reportResult',{
        email: req.user.email,
        company_id: company_id,
        comp_data:userCompany,
        vatObl:vatObl
        })
    }catch(err){
        res.render('reportResult',{error: true, message: "Kasutajal pole sellist dokumenti. Alusta uue analüüsi koostamist.",email: req.user.email })
    }
    
})

module.exports = router;