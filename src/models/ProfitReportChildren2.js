const mongoose = require('mongoose');

module.exports = mongoose.model ('profitReportChildren2',{
    year: {type: Date, required: true},
    salesRevenue: { type: Number, required: true },
    creditSalesRevenue0: { type: Number, required: true},
    creditSalesRevenue9: { type: Number, required: true },
    creditSalesRevenue20: { type: Number, required: true },
    retailRevenue: { type: Number, required: true},
    salesCost: { type: Number, required: true },
    bioAssetsProfitLoss: { type: Number, required: true},
    marketingExpenses: { type: Number, required: true },
    administrativeExpenses: { type: Number, required: true },
    otherOperatingRevenue: { type: Number, required: true },
    otherOperatingCharges: { type: Number, required: true },
    profitLossSubsidiaries: { type: Number, required: true},
    profitLossAssociated: { type: Number, required: true },
    profitLossFinancialInvestments: { type: Number, required: true },
    interestIncome: { type: Number, required: true },
    interestExpense: { type: Number, required: true },
    otherFinancialIncomeExpenses: { type: Number, required: true },
    incomeTaxExpense: { type: Number, required: true },
});