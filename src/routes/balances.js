const router = require('express').Router();
const {apiAuth} = require('../middlewares');
const balance = require('../models/balance');
const balanceChildren= require('../models/balanceChildren');

//Get request for balance data

router.post('/', apiAuth ,async (req, res)=>{

    //Find balance document with company document id

    const findBalance = await balance.findOne({_id:req.body.companyId});
    if(!findBalance) return res.status(404).json({error:"no such balance found!"});

    //Send balances back

    res.status(200).json(findBalance.dates);

})

//put request to update or add data

router.put('/', apiAuth,async (req, res) => {

    //Find balance document with company document id

    const findBalance = await balance.findOne({_id:req.body.companyId});
    if(!findBalance) return res.status(404).json({error:"no such balance found!"});

    //Check if the dates array contains anything, and empty it if it does

    if(findBalance.dates.length!=0){
        findBalance.dates=[];
    }

    //Get balances array from request body

    let balancesArray = req.body.balances;

    //Push each balance object from balance array to findBalance objects dates array

    balancesArray.forEach(balance => {
        const newBalanceChild = new balanceChildren({
            date: balance.date,
            mingiNumber1 : balance.mingiNumber1,
            mingiNumber2 : balance.mingiNumber2,
            mingiNumber3 : balance.mingiNumber3
        })
        findBalance.dates.push(newBalanceChild);
    });



    try{
        await findBalance.save();
        res.status(200).json({success:"tinki vinki"});
    }catch(err){
        res.status(500).json({error:err});
        console.log(err)
    }
    }
)

module.exports = router;