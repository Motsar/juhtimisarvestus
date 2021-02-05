const router = require('express').Router();
const profitReport = require('../models/ProfitReport');
const profitReportChildren1 = require('../models/ProfitReportChildren1');
const profitReportChildren2 = require('../models/ProfitReportChildren2');
const {apiAuth} = require('../middlewares');

//Get request for balance data

router.post('/', apiAuth ,async (req, res)=>{

    //Find balance document with company document id

    const findProfitReport = await profitReport.findOne({_id:req.body.companyId});
    if(!findProfitReport) return res.status(404).json({error:"no such profit report found!"});

    //Send balances back

    res.status(201).json(findProfitReport.years);

})

//put request to update or add data

router.put('/', apiAuth,async (req, res) => {

        //Find balance document with company document id

        const findProfitReports = await profitReport.findOne({_id:req.body.companyId});
        if(!findProfitReports) return res.status(404).json({error:"no such balance found!"});

        //Get balances array from request body

        let profitReports = req.body.years;

        //Check if the dates array contains atleast 2 balances

        if(profitReports.length<2) return res.status(404).json({error:"Atleast 2 years data is needed to be added"});

        //Check if the dates array contains anything, and empty array

        if(findProfitReports.years.length!==0){
            findProfitReports.years=[];
        }

        //find which profit report schema company uses

        let companyReportSchemaType = req.body.companyReportSchemaType;
        if(!companyReportSchemaType) return res.status(400).json({error:"company profit report schema type required"});
        if(companyReportSchemaType<1 || companyReportSchemaType>2) return res.status(400).json({error:"company profit report schema type needs to be 1 or 2"})



        //Push each balance object from balance array to findBalance objects dates array
        if(companyReportSchemaType===1){
            profitReports.forEach(profitReports => {
                let newProfitReportChild = new profitReportChildren1({
                    year: profitReports.year,
                    salesRevenue: profitReports.salesRevenue,
                    otherOperatingRevenue: profitReports.otherOperatingRevenue,
                    changesGoodsWip: profitReports.changesGoodsWip,
                    ownPurposeCapitalised: profitReports.ownPurposeCapitalised,
                    goodsRawMaterialsServices: profitReports.goodsRawMaterialsServices,
                    otherOperatingExpenses: profitReports.otherOperatingExpenses,
                    wagesSalaries: profitReports.wagesSalaries,
                    socialSecurityCosts: profitReports.socialSecurityCosts,
                    pensionExpenses: profitReports.pensionExpenses,
                    fixedAssetsDepreciationImpairment: profitReports.fixedAssetsDepreciationImpairment,
                    otherOperatingCharges: profitReports.otherOperatingCharges,
                    financialSubsidiariesShares: profitReports.financialSubsidiariesShares,
                    financialAssociatedShares: profitReports.financialAssociatedShares,
                    financialLtFinancialInvestments: profitReports.financialLtFinancialInvestments,
                    interestExpense: profitReports.interestExpense,
                    profitLossesForeignCurrencies: profitReports.profitLossesForeignCurrencies,
                    otherFinancialIncomeExpenses: profitReports.otherFinancialIncomeExpenses,
                    incomeTaxExpense: profitReports.incomeTaxExpense
                })
                findProfitReports.years.push(newProfitReportChild);
            });
        }else{
            profitReports.forEach(profitReports => {
                let newProfitReportChild = new profitReportChildren2({
                    year: profitReports.year,
                    salesRevenue: profitReports.salesRevenue,
                    salesCost: profitReports.salesCost,
                    marketingExpenses: profitReports.marketingExpenses,
                    administrativeExpenses: profitReports.administrativeExpenses,
                    otherOperatingRevenue: profitReports.otherOperatingCharges,
                    otherOperatingCharges: profitReports.otherOperatingCharges,
                    financialSubsidiariesShares: profitReports.financialSubsidiariesShares,
                    financialAssociatedShares: profitReports.financialAssociatedShares,
                    financialLtFinancialInvestments: profitReports.financialLtFinancialInvestments,
                    interestExpense: profitReports.interestExpense,
                    protLossesForeignCurrencies: profitReports.protLossesForeignCurrencies,
                    otherFinancialIncomeExpenses: profitReports.otherFinancialIncomeExpenses,
                    incomeTaxExpense: profitReports.incomeTaxExpense,
                    minorityHolding:  profitReports.minorityHolding,
                })
                findProfitReports.years.push(newProfitReportChild);
            });
        }


        try{
            await findProfitReports.save();
            res.status(201).json({success:"profit reports saved"});
        }catch(err){
            res.status(500).json({error:err});
            console.log(err)
        }
    }
)

module.exports = router;