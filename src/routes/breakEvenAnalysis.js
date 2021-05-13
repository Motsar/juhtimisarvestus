const router = require('express').Router();
const breakEvenAnalysis = require('../models/BreakEvenAnalysis');
const Company = require('../models/Company');
const {apiAuth,cleanBody} = require('../middlewares');
require('dotenv').config('../.env');

router.put('/', apiAuth,cleanBody ,async (req, res)=>{

    //check if the given company_id is related to user

    let id = req.body.company_id;
    if(!id)return res.status(404).json({error:"Ettevõtte ID puudub."});
    let company = await Company.findOne({_id: id, user_id:req.userId});
    if(!company) return res.status(404).json({error:"Kasutajaga seotud ettevõtte analüüsi ei leitud!"});

    //Find break-even point analysis document with company document id

    const findBreakEvenAnalysis = await breakEvenAnalysis.findOne({_id:id});
    if(!findBreakEvenAnalysis) return res.status(404).json({error: "Sellist tasuvuspunkti dokumenti ei leitud!" });

    //Get salesTurnover and expenses array´s from request body

    let salesTurnoverArray = req.body.salesTurnover;
    let expensesArray = req.body.expenses;

    //Check if the dates array contains atleast 2 balances

    if(salesTurnoverArray.length === 0 || expensesArray.length===0) return res.status(404).json({error: "Mõlemad väljad peavad olema täidetud!" });

    //Check if the dates array contains anything, and empty array

    if(findBreakEvenAnalysis.salesTurnover.length!==0 || findBreakEvenAnalysis.expenses.length!==0){
        findBreakEvenAnalysis.salesTurnover=[];
        findBreakEvenAnalysis.expenses=[];
    }

    //Push data to break-even point analysis

    salesTurnoverArray.forEach(monthTurnover=>{
        let turnOverNum = parseFloat(monthTurnover)
        findBreakEvenAnalysis.salesTurnover.push(turnOverNum);
    })

    expensesArray.forEach(monthExpenses=>{
        let expensesNum= parseFloat(monthExpenses)
        findBreakEvenAnalysis.expenses.push(expensesNum);
    })

    try{
        await findBreakEvenAnalysis.save();
        res.status(201).json({success:"Tasuvuspunkti andmed on salvestatud"});
    }catch(err){
        res.status(500).json({error:err});
    }
})


router.post('/', apiAuth,cleanBody ,async (req, res)=>{

    //Check if the given company_id is related to user

    let id = req.body.company_id;
    if(!id)return res.status(404).json({error:"Ettevõtte ID puudub."});
    let company = await Company.findOne({_id: id, user_id:req.userId});
    if(!company) return res.status(404).json({error:"Kasutajaga seotud ettevõtte analüüsi ei leitud!"});

    //Find break-even point analysis document with company document id

    const findBreakEvenAnalysis = await breakEvenAnalysis.findOne({_id:id});
    if(!findBreakEvenAnalysis) return res.status(404).json({error: "Sellist tasuvuspunkti dokumenti ei leitud!" });

    try{
        res.status(200).json({breakEvenData:findBreakEvenAnalysis});
    }catch(err){
        res.status(500).json({error:err});
    }
})


module.exports = router;