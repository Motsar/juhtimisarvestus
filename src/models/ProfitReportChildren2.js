const mongoose = require('mongoose');

module.exports = mongoose.model ('profitReportChildren2',{
    year: {type: Date, required: true},
    salesRevenue: { type: Number, required: true },
    salesCost: { type: Number, required: true },
    marketingExpenses: { type: Number, required: true },
    administrativeExpenses: { type: Number, required: true },
    otherOperatingRevenue: { type: Number, required: true },
    otherOperatingCharges: { type: Number, required: true },
    financialSubsidiariesShares: { type: Number, required: true },
    financialAssociatedShares: { type: Number, required: true },
    financialLtFinancialInvestments: { type: Number, required: true },
    interestExpense: { type: Number, required: true },
    protLossesForeignCurrencies: { type: Number, required: true },
    otherFinancialIncomeExpenses: { type: Number, required: true },
    incomeTaxExpense: { type: Number, required: true },
    minorityHolding: { type: Number, required: true }
});