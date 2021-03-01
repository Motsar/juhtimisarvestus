const router = require('express').Router();
const Company = require('../models/Company')
const profitReport = require('../models/ProfitReport');
const profitReportChildren1 = require('../models/ProfitReportChildren1');
const profitReportChildren2 = require('../models/ProfitReportChildren2');
const {apiAuth} = require('../middlewares');

//Get request for balance data

router.post('/', apiAuth ,async (req, res)=>{

    //Find balance document with company document id

    const findProfitReport = await profitReport.findOne({_id:req.body.companyId});
    if(!findProfitReport) return res.status(404).json({error: "Sellist kasumiaruannet ei leitud." });

    //Send balances back

    res.status(201).json(findProfitReport.years);

})

//put request to update or add data

router.put('/', apiAuth,async (req, res) => {

        //Find balance document with company document id

        const findProfitReports = await profitReport.findOne({_id:req.body.companyId});
        if(!findProfitReports) return res.status(404).json({error: "Sellist bilanssi ei leitud." });

        //Get balances array from request body

        let profitReports = req.body.years;

        //Check if the dates array contains atleast 2 profit reports

        if(profitReports.length<2) return res.status(404).json({error: "Tuleb lisada vähemalt kahe aasta andmed." });

        //Check if the dates array contains anything, and empty array

        if(findProfitReports.years.length!==0){
            findProfitReports.years=[];
        }

        //find which profit report schema company uses
        let findCompany = await Company.findOne({_id:req.body.companyId});
        let companyReportSchemaType = findCompany.Profit_report_schema;
        if(!companyReportSchemaType) return res.status(400).json({error: "Tuleb valida ettevõtte kasumiaruande skeem" });
        if(companyReportSchemaType<1 || companyReportSchemaType>2) return res.status(400).json({error: "Kasumiaruande skeem peab olema 1 või 2" });



        //Push each balance object from balance array to findBalance objects dates array
        if(companyReportSchemaType===1){
            profitReports.forEach(profitReports => {
                let newProfitReportChild = new profitReportChildren1({
                    year: profitReports.year,
                    salesRevenue: profitReports.salesRevenue,
                    creditSalesRevenue0: profitReports.creditSalesRevenue0,
                    creditSalesRevenue9: profitReports.creditSalesRevenue9,
                    creditSalesRevenue20: profitReports.creditSalesRevenue20,
                    creditSalesRevenueTotal: profitReports.creditSalesRevenueTotal,//added --------------> 15.02.2021
                    retailRevenueTotal: profitReports.retailRevenueTotal,//changed--------------> 15.02.2021
                    otherOperatingRevenue: profitReports.otherOperatingRevenue,
                    agriGoodsWip: profitReports.agriGoodsWip,
                    bioAssetsProfitLoss: profitReports.bioAssetsProfitLoss,
                    changesGoodsWip: profitReports.changesGoodsWip,
                    ownPurposeCapitalised: profitReports.ownPurposeCapitalised,
                    goodsRawMaterialsServices: profitReports.goodsRawMaterialsServices,
                    otherOperatingExpenses: profitReports.otherOperatingExpenses,
                    wagesSalaries: profitReports.wagesSalaries,
                    fixedAssetsDepreciationImpairment: profitReports.fixedAssetsDepreciationImpairment,
                    currentAssetsDiscounts: profitReports.currentAssetsDiscounts,
                    otherOperatingCharges: profitReports.otherOperatingCharges,
                    earningsMinusLosses: profitReports.earningsMinusLosses,//added--------------> 15.02.2021
                    profitLossSubsidiaries: profitReports.profitLossSubsidiaries,
                    profitLossAssociated: profitReports.profitLossAssociated,
                    profitLossFinancialInvestments: profitReports.profitLossFinancialInvestments,
                    interestIncome: profitReports.interestIncome,
                    interestExpense: profitReports.interestExpense,
                    otherFinancialIncomeExpenses: profitReports.otherFinancialIncomeExpenses,
                    earningsMinusLossesBeforeIncomeExpenses: profitReports.earningsMinusLossesBeforeIncomeExpenses,//added--------------> 15.02.2021
                    incomeTaxExpense: profitReports.incomeTaxExpense,
                    financialYearEarningsMinusLosses: profitReports.financialYearEarningsMinusLosses,//added--------------> 15.02.2021
                });
                findProfitReports.years.push(newProfitReportChild);
            });
        }else{
            profitReports.forEach(profitReports => {
                let newProfitReportChild = new profitReportChildren2({
                    year: profitReports.year,
                    salesRevenue: profitReports.salesRevenue,
                    creditSalesRevenue0: profitReports.creditSalesRevenue0,
                    creditSalesRevenue9: profitReports.creditSalesRevenue9,
                    creditSalesRevenue20: profitReports.creditSalesRevenue20,
                    creditSalesRevenueTotal: profitReports.creditSalesRevenueTotal,//added --------------> 15.02.2021
                    retailRevenueTotal: profitReports.retailRevenueTotal,//changed--------------> 15.02.2021
                    salesCost: profitReports.salesCost,
                    grossProfitMinusLoss: profitReports.grossProfitMinusLoss,//added --------------> 15.02.2021
                    bioAssetsProfitLoss: profitReports.bioAssetsProfitLoss,
                    marketingExpenses: profitReports.marketingExpenses,
                    administrativeExpenses: profitReports.administrativeExpenses,
                    otherOperatingRevenue: profitReports.otherOperatingCharges,
                    otherOperatingCharges: profitReports.otherOperatingCharges,
                    earningsMinusLosses: profitReports.earningsMinusLosses,//added--------------> 15.02.2021
                    profitLossSubsidiaries: profitReports.profitLossSubsidiaries,
                    profitLossAssociated: profitReports.profitLossAssociated,
                    profitLossFinancialInvestments: profitReports.profitLossFinancialInvestments,
                    interestIncome: profitReports.interestIncome,
                    interestExpense: profitReports.interestExpense,
                    otherFinancialIncomeExpenses: profitReports.otherFinancialIncomeExpenses,
                    earningsMinusLossesBeforeIncomeExpenses: profitReports.earningsMinusLossesBeforeIncomeExpenses,//added--------------> 15.02.2021
                    incomeTaxExpense: profitReports.incomeTaxExpense,
                    financialYearEarningsMinusLosses: profitReports.financialYearEarningsMinusLosses//added--------------> 15.02.2021
                });
                findProfitReports.years.push(newProfitReportChild);
            });
        }


        try{
            await findProfitReports.save();
            res.status(201).json({success: "Kasumiaruanded salvestatud" });
        }catch(err){
            res.status(500).json({error:err});
            console.log(err)
        }
    }
)

module.exports = router;