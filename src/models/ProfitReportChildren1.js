const mongoose = require('mongoose');

module.exports = mongoose.model ('profitReportChildren1',{
    year: {type: Date, required: true},
    salesRevenue: { type: Number, required: true },
    creditSalesRevenue0: { type: Number, required: true},
    creditSalesRevenue9: { type: Number, required: true },
    creditSalesRevenue20: { type: Number, required: true },
    retailRevenue: { type: Number, required: true},
    otherOperatingRevenue: { type: Number, required: true },
    agriGoodsWip: { type: Number, required: true},
    bioAssetsProfitLoss: { type: Number, required: true},
    changesGoodsWip: { type: Number, required: true },
    ownPurposeCapitalised: { type: Number, required: true },
    goodsRawMaterialsServices: { type: Number, required: true },
    otherOperatingExpenses: { type: Number, required: true },
    wagesSalaries: { type: Number, required: true },
    fixedAssetsDepreciationImpairment: { type: Number, required: true },
    currentAssetsDiscounts: { type: Number, required: true },
    otherOperatingCharges: { type: Number, required: true },
    profitLossSubsidiaries: { type: Number, required: true},
    profitLossAssociated: { type: Number, required: true},
    profitLossFinancialInvestments: { type: Number, required: true},
    interestIncome: { type: Number, required: true},
    interestExpense: { type: Number, required: true },
    otherFinancialIncomeExpenses: { type: Number, required: true },
    incomeTaxExpense: { type: Number, required: true }
});