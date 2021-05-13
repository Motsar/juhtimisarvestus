const router = require('express').Router();
const Company = require('../models/Company');
const { apiAuth,cleanBody } = require('../middlewares');
const balance = require('../models/Balance');
const profitReport = require('../models/ProfitReport');
const profitReportChildren1 = require('../models/ProfitReportChildren1');
const profitReportChildren2 = require('../models/ProfitReportChildren2');
const balanceChildren = require('../models/BalanceChildren');
const breakEvenAnalysis = require('../models/BreakEvenAnalysis');
require('dotenv').config('../.env');

//post and save company data to database

router.post('/', apiAuth,cleanBody, async (req, res) => {

    //Checking if the company is already in database

    const compExists = await Company.findOne({ compName: req.body.compName, user_id: req.userId });
    if (compExists) return res.status(400).json({ "error": "Sellise nimega ettevõte on juba olemas." });

    let email = req.body.comp_email

    //Check how many comanies user has

    const companies = await Company.find({user_id: req.userId });
    if(companies.length>10) return res.status(403).json({ "error": "Kasutajal on analüüside limiit ületatud." });


    //create a new comnpany

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

    try {
        const savedCompany = await company.save();
        //create a new profitreport and save it with empty values

        const newProfitReport = new profitReport({ _id: savedCompany._id });

        if (req.body.Profit_report_schema === 1) {
            for (let i = 0; i < 2; i++) {
                let zeroProfitReportChild = new profitReportChildren1({
                    year: new Date("1990-01-01"),
                    salesRevenue: 0,
                    creditSalesRevenue0: 0,
                    creditSalesRevenue9: 0,
                    creditSalesRevenue20: 0,
                    creditSalesRevenueTotal: 0,
                    retailRevenueTotal: 0,
                    otherOperatingRevenue: 0,
                    agriGoodsWip: 0,
                    bioAssetsProfitLoss: 0,
                    changesGoodsWip: 0,
                    ownPurposeCapitalised: 0,
                    goodsRawMaterialsServices: 0,
                    otherOperatingExpenses: 0,
                    wagesSalaries: 0,
                    fixedAssetsDepreciationImpairment: 0,
                    currentAssetsDiscounts: 0,
                    otherOperatingCharges: 0,
                    earningsMinusLosses: 0,
                    profitLossSubsidiaries: 0,
                    profitLossAssociated: 0,
                    profitLossFinancialInvestments: 0,
                    interestIncome: 0,
                    interestExpense: 0,
                    otherFinancialIncomeExpenses: 0,
                    earningsMinusLossesBeforeIncomeExpenses: 0,
                    incomeTaxExpense: 0,
                    financialYearEarningsMinusLosses: 0
                })
                newProfitReport.years.push(zeroProfitReportChild)
            }
        } else {
            for (let i = 0; i < 2; i++) {
                let zeroProfitReportChild = new profitReportChildren2({
                    year:  new Date("1990-01-01"),
                    salesRevenue: 0,
                    creditSalesRevenue0: 0,
                    creditSalesRevenue9: 0,
                    creditSalesRevenue20: 0,
                    creditSalesRevenueTotal: 0,
                    retailRevenueTotal: 0,
                    salesCost: 0,
                    grossProfitMinusLoss: 0,
                    bioAssetsProfitLoss: 0,
                    marketingExpenses: 0,
                    administrativeExpenses: 0,
                    otherOperatingRevenue: 0,
                    otherOperatingCharges: 0,
                    earningsMinusLosses: 0,
                    profitLossSubsidiaries: 0,
                    profitLossAssociated: 0,
                    profitLossFinancialInvestments: 0,
                    interestIncome: 0,
                    interestExpense: 0,
                    otherFinancialIncomeExpenses: 0,
                    earningsMinusLossesBeforeIncomeExpenses: 0,
                    incomeTaxExpense: 0,
                    financialYearEarningsMinusLosses: 0
                })
                newProfitReport.years.push(zeroProfitReportChild)
            }
        }

        //create a new balance document and save it with empty values

        const newBalance = new balance({ _id: savedCompany._id});

        for (let i = 0; i < 2; i++) {
            const newBalanceChild = new balanceChildren({
                date:  new Date("1990-01-01"),
                cash: 0,
                stInvestments: 0,
                receivablesPrepayments: 0,
                stTradeReceivables: 0,
                stRelatedPartyReceivables: 0,
                stPrepaidDeferredTaxes: 0,
                stOtherReceivables: 0,
                stServicesPrepayments: 0,
                inventories: 0,
                rawMaterials: 0,
                wip: 0,
                finishedGoods: 0,
                goodsForResale: 0,
                inventoriesPrepayments: 0,
                stBiologicalAssets: 0,
                totalCurrentAssets: 0,
                investmentsSubUnder: 0,
                subsidiaryShares: 0,
                associateShares: 0,
                ltInvestments: 0,
                ltReceivablesPrepayments: 0,
                ltTradeReceivables: 0,
                ltRelatedPartyReceivables: 0,
                ltPrepaidDeferredTaxes: 0,
                ltOtherReceivables: 0,
                ltServicesPrepayments: 0,
                realEstateInv: 0,
                tangibleAssets: 0,
                land: 0,
                buildings: 0,
                machineryEquipment: 0,
                otherTangibleAssets: 0,
                cipPrepayments: 0,
                assetsPrepayments: 0,
                ltBiologicalAssets: 0,
                intangibleFixedAssets: 0,
                goodwill: 0,
                developmentCost: 0,
                otherIntangibleAssets: 0,
                intanglibleAssetsPrepayments: 0,
                totalFixedAssets: 0,
                totalAssets: 0,
                stLoanLiabilities: 0,
                stLoansNotes: 0,
                ltCurrentLoanLiabilities: 0,
                debtsPrepaymentsReceived: 0,
                stTradeCreditors: 0,
                stEmployeeLiabilities: 0,
                stTaxesPayable: 0,
                stOtherPayables: 0,
                stOtherIncome: 0,
                stBuyersPrepaymentsReceived: 0,
                stProvisions: 0,
                guaranteeProvisions: 0,
                taxProvisions: 0,
                otherProvisions: 0,
                stTargetedFinancings: 0,
                totalCurrentLiabilities: 0,
                ltLoanLiabilities: 0,
                loansNotesFinancialLeasePayables: 0,
                convertibleDebt: 0,
                ltDebtsPrepayments: 0,
                ltTradeCreditors: 0,
                ltEmployeeLiabilities: 0,
                ltTaxesPayable: 0,
                ltOtherPayables: 0,
                ltOtherIncome: 0,
                ltProvisions: 0,
                ltTargetedFinancings: 0,
                ltLiabilitiesTotal: 0,
                totalLiabilities: 0,
                shareCapital: 0,
                unregisteredShare: 0,
                unpaidShareCapital: 0,
                sharePremium: 0,
                lessOwnShares: 0,
                legalReserve: 0,
                otherReserves: 0,
                otherOwnersEquity: 0,
                retainedProfitLoss: 0,
                financialYearNetProfitLoss: 0,
                ownersEquityTotal: 0,
                totalLiabilitiesOwnersEquity: 0
            })
            newBalance.dates.push(newBalanceChild)
        }

        //create new breakevenpoint analysis and fill it with zero values

        const newBreakEvenAnalysis = new breakEvenAnalysis({ _id: savedCompany._id });

        for (let i = 0; i < 12; i++) {
            newBreakEvenAnalysis.salesTurnover.push(0)
            newBreakEvenAnalysis.expenses.push(0)
        }
        await newBalance.save();
        await newProfitReport.save();
        await newBreakEvenAnalysis.save();
        res.status(201).json({ _id: company._id, vat_obligatory: company.vat_obligatory, Profit_report_schema: company.Profit_report_schema, success: "Ettevõtte andmed on salvestatud" });
    } catch (err) {
        res.status(401).json({ error: err });
    }
})

router.get('/', apiAuth, async (req, res) => {

    // Get company documents that belong to user

    let userCompanies = await Company.find({ user_id: req.userId }).select('_id compName regNum address email phone vat yearLength Profit_report_schema additional_info analyse_date').exec();
    if (!userCompanies) return res.status(404).json({ error: "Kasutajal pole ettevõttega seotud dokumente. Alusta uue analüüsi koostamist." });

    // Send companies object, if error send error message

    try {
        res.status(200).json({
            companies: userCompanies
        })
    } catch (err) {
        res.status(500).json({ error: err })
    }

});

//Update company document

router.patch('/', apiAuth,cleanBody, async (req, res) => {

    //error handling

    if (Object.keys(req.body).length === 0) return res.status(400).json({ error: "Uuendamiseks sisesta andmed." });
    let id = req.body._id;
    if (!id) return res.status(404).json({ error: "Ettevõtte ID puudub." });
    let company = await Company.findOne({ _id: id, user_id: req.userId });
    if (!company) return res.status(401).json({ error: "Ettevõttega seotud analüüse ei leitud." });
    try{
        await company.updateOne(req.body);
        res.status(200).json({success: "Ettevõtte andmed on salvestatud"})
    }catch(err) {
        res.status(500).json({ error: err })
    }
    
})

//Delete analysis

router.delete('/', apiAuth, async (req, res) => {

    // Check if user has delete document in database

    let id = req.body.company_id;
    if (!id) return res.status(404).json({ error: "Ettevõtte ID puudub." });
    let company = await Company.findOne({ _id: id, user_id: req.userId });
    if (!company) return res.status(401).json({ error: "Ettevõttega seotud analüüse ei leitud." })

    // Delete document, if error send error message

    try {
        await Company.deleteOne({ _id: company._id })
        await balance.deleteOne({ _id: company._id })
        await profitReport.deleteOne({ _id: company._id })
        await breakEvenAnalysis.deleteOne({ _id: company._id })
        res.status(201).json({ success: "Ettevõttage seotud analüüs on kustutatud." })
    } catch (err) {
        res.status(401).json({ error: err });
    }
});


module.exports = router;