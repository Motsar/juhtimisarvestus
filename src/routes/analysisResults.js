const router = require('express').Router();
const balance = require('../models/Balance');
const profitReport = require('../models/ProfitReport');
const Company = require('../models/Company');
const { apiAuth,
        cleanBody,
        NetWorkingCapital,
        CurrentRatio,
        QuickRatio,
        CashRatio,
        totalAssetTurnover,
        daysAssetsHold,
        fixedAssetTurnover,
        daysFixedAssetsHold,
        accountsReceivablesTurnover,
        daysSalesOutstanding,
        inventoryTurnover,
        daysInventoryHeld,
        accountsPayableTurnover,
        daysAccountsPayableOutstanding,
        returnOnTotalAssets,
        returnOnInvestment,
        roeOnEquity,
        roeOnSales,
        grossProfitMargin,
        operatingProfitMargin,
        totalDeptRatio,
        solidityEquityRatio,
        ltDebtRatio,
        horizontalAnalysisBalances,
        horizontalAnalysisProfitReps,
        verticalAnalysisBalances,
        verticalAnalysisProfitReps } = require('../middlewares');

router.post('/', apiAuth,cleanBody, async (req, res) => {

    let id = req.body.company_id;
    if (!id) return res.status(404).json({ error: "Ettevõtte ID puudub." });
    
    let company = await Company.findOne({ _id: id, user_id: req.userId });
    if (!company) return res.status(404).json({ error: "kasutajaga seotud ettevõtte analüüsi ei leitud." });

    let findBalance = await balance.findOne({ _id: id });
    if (!findBalance) return res.status(404).json({ error: "Bilanssi ei leitud" });

    let findProfitReport = await profitReport.findOne({ _id: id });
    if (!findProfitReport) return res.status(404).json({ error: "Kasumiaruannet ei leitud" });

    let balances = findBalance.dates;
    let profitReports = findProfitReport.years;

    if(balances.length!==profitReports.length) return res.status(404).json({error:"Sisestage võrdne arv bilansse ja kasumiaruandeid!"});

    let yearLength = company.yearLength

    let results = {
        Profit_report_schema: company.Profit_report_schema,
        NetWorkingCapitals: NetWorkingCapital(balances),
        CurrentRatio: CurrentRatio(balances),
        QuickRatio: QuickRatio(balances),
        CashRatio: CashRatio(balances),
        TotalAssetTurnover: totalAssetTurnover(balances, profitReports),
        DaysAssetsHold: daysAssetsHold(totalAssetTurnover(balances, profitReports),yearLength),
        FixedAssetTurnover: fixedAssetTurnover(balances,profitReports),
        DaysFixedAssetsHold: daysFixedAssetsHold(fixedAssetTurnover(balances,profitReports),yearLength),
        AccountsReceivablesTurnover: accountsReceivablesTurnover(balances,profitReports,company.vat_obligatory),
        DaysSalesOutstanding: daysSalesOutstanding(accountsReceivablesTurnover(balances,profitReports,company.vat_obligatory),yearLength),
        InventoryTurnover: inventoryTurnover(balances, profitReports, company.Profit_report_schema),
        DaysInventoryHeld: daysInventoryHeld(inventoryTurnover(balances, profitReports, company.Profit_report_schema), yearLength),
        AccountsPayableTurnover: accountsPayableTurnover(balances, profitReports, company.Profit_report_schema),
        DaysAccountsPayableOutstanding: daysAccountsPayableOutstanding(accountsPayableTurnover(balances, profitReports, company.Profit_report_schema), yearLength),
        ReturnOnTotalAssets: returnOnTotalAssets(balances, profitReports),
        ReturnOnInvestment: returnOnInvestment(balances, profitReports),
        RoeOnEquity: roeOnEquity(balances, profitReports),
        RoeOnSales: roeOnSales(profitReports),
        GrossProfitMargin: grossProfitMargin(profitReports,company.Profit_report_schema),
        OperatingProfitMargin: operatingProfitMargin(profitReports),
        TotalDeptRatio: totalDeptRatio(balances),
        SolidityEquityRatio: solidityEquityRatio(balances),
        LtDebtRatio: ltDebtRatio(balances),
        HorizontalAnalysisBalances: horizontalAnalysisBalances(balances),
        HorizontalAnalysisProfitReps: horizontalAnalysisProfitReps(profitReports, company.Profit_report_schema),
        VerticalAnalysisBalances: verticalAnalysisBalances(balances),
        VerticalAnalysisProfitReps: verticalAnalysisProfitReps(profitReports, company.Profit_report_schema)
    };
    try {
        res.status(200).json({ results })
    } catch (err) {
        res.status(500).json({ "error": err })
    }
})

module.exports = router;