const mongoose = require('mongoose');

module.exports = mongoose.model ('profitReportChildren1',{
    year: {type: Date, required: true},
    salesRevenue: { type: Number, required: true },
    otherOperatingRevenue: { type: Number, required: true },
    changesGoodsWip: { type: Number, required: true },
    ownPurposeCapitalised: { type: Number, required: true },
    goodsRawMaterialsServices: { type: Number, required: true },
    otherOperatingExpenses: { type: Number, required: true },
    wagesSalaries: { type: Number, required: true },
    socialSecurityCosts: { type: Number, required: true },
    pensionExpenses: { type: Number, required: true },
    fixedAssetsDepreciationImpairment: { type: Number, required: true },
    otherOperatingCharges: { type: Number, required: true },
    financialSubsidiariesShares: { type: Number, required: true },
    financialAssociatedShares: { type: Number, required: true },
    financialLtFinancialInvestments: { type: Number, required: true },
    interestExpense: { type: Number, required: true },
    profitLossesForeignCurrencies: { type: Number, required: true },
    otherFinancialIncomeExpenses: { type: Number, required: true },
    incomeTaxExpense: { type: Number, required: true }
});