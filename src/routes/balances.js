const router = require('express').Router();
const {apiAuth} = require('../middlewares');
const balance = require('../models/balance');
const balanceChildren= require('../models/balanceChildren');

//post request for balance data

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

    if(findBalance.dates.length<2) return res.status(404).json({error:"Atleast 2 years data is needed to be added"});

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
            cash: balance.cash,
            stInvestments: balance.stInvestments,
            receivablesPrepayments: balance.receivablesPrepayments,
            stTradeReceivables: balance.stTradeReceivables,
            stRelatedPartyReceivables: balance.stRelatedPartyReceivables,
            stPrepaidDeferredTaxes: balance.stPrepaidDeferredTaxes,
            stOtherReceivables: balance.stOtherReceivables,
            stServicesPrepayments: balance.stServicesPrepayments,
            inventories: balance.inventories,
            rawMaterials: balance.rawMaterials,
            wip: balance.wip,
            finishedGoods: balance.finishedGoods,
            goodsForResale: balance.goodsForResale,
            inventoriesPrepayments: balance.inventoriesPrepayments,
            stBiologicalAssets: balance.stBiologicalAssets,
            investmentsSubUnder: balance.investmentsSubUnder,
            subsidiaryShares: balance.subsidiaryShares,
            associateShares: balance.associateShares,
            ltInvestments: balance.ltInvestments,
            ltReceivablesPrepayments: balance.ltReceivablesPrepayments,
            ltTradeReceivables: balance.ltTradeReceivables,
            ltRelatedPartyReceivables: balance.ltRelatedPartyReceivables,
            ltPrepaidDeferredTaxes: balance.ltPrepaidDeferredTaxes,
            ltOtherReceivables: balance.ltOtherReceivables,
            ltServicesPrepayments: balance.ltServicesPrepayments,
            realEstateInv: balance.realEstateInv,
            tangibleAssets: balance.tangibleAssets,
            land: balance.land,
            buildings: balance.buildings,
            machineryEquipment: balance.machineryEquipment,
            otherTangibleAssets: balance.otherTangibleAssets,
            cipPrepayments: balance.cipPrepayments,
            assetsPrepayments: balance.assetsPrepayments,
            ltBiologicalAssets: balance.ltBiologicalAssets,
            intangibleFixedAssets: balance.intangibleFixedAssets,
            goodwill: balance.goodwill,
            developmentCost: balance.developmentCost,
            otherIntangibleAssets: balance.otherIntangibleAssets,
            intanglibleAssetsPrepayments: balance.intanglibleAssetsPrepayments,
            stLoanLiabilities: balance.stLoanLiabilities,
            stLoansNotes: balance.stLoansNotes,
            ltCurrentLoanLiabilities : balance.ltCurrentLoanLiabilities,
            debtsPrepaymentsReceived: balance.debtsPrepaymentsReceived,
            stTradeCreditors: balance.stTradeCreditors,
            stEmployeeLiabilities: balance.stEmployeeLiabilities,
            stTaxesPayable: balance.stTaxesPayable,
            stOtherPayables: balance.stOtherPayables,
            stOtherIncome: balance.stOtherIncome,
            stBuyersPrepaymentsReceived: balance.stBuyersPrepaymentsReceived,
            stProvisions: balance.stProvisions,
            guaranteeProvisions: balance.guaranteeProvisions,
            taxProvisions: balance.taxProvisions,
            otherProvisions: balance.otherProvisions,
            stTargetedFinancings: balance.stTargetedFinancings,
            ltLoanLiabilities: balance.ltLoanLiabilities,
            loansNotesFinancialLeasePayables: balance.loansNotesFinancialLeasePayables,
            convertibleDebt: balance.convertibleDebt,
            ltDebtsPrepayments: balance.ltDebtsPrepayments,
            ltTradeCreditors: balance.ltTradeCreditors,
            ltEmployeeLiabilities: balance.ltEmployeeLiabilities,
            ltTaxesPayable: balance.ltTaxesPayable,
            ltOtherPayables: balance.ltOtherPayables,
            ltOtherIncome: balance.ltOtherIncome,
            ltTargetedFinancings: balance.ltTargetedFinancings,
            shareCapital: balance.shareCapital,
            unregisteredShare: balance.unregisteredShare,
            unpaidShareCapital: balance.unpaidShareCapital,
            sharePremium: balance.sharePremium,
            lessOwnShares: balance.lessOwnShares,
            legalReserve: balance.legalReserve,
            otherReserves: balance.otherReserves,
            otherOwnersEquity: balance.otherOwnersEquity,
            retainedProfitLoss: balance.retainedProfitLoss,
            financialYearNetProfitLoss: balance.financialYearNetProfitLoss
        })
        findBalance.dates.push(newBalanceChild);
    });

    try{
        await findBalance.save();
        res.status(200).json({success:"balances added"});
    }catch(err){
        res.status(500).json({error:err});
        console.log(err)
    }
    }
)

module.exports = router;