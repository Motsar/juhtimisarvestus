const mongoose = require('mongoose');

module.exports = mongoose.model ('profitReportChildren2',{
    year: {type: Date, required: true},
    salesRevenue: { type: Number, required: true },
    creditSalesRevenue0: { type: Number, required: true},
    creditSalesRevenue9: { type: Number, required: true },
    creditSalesRevenue20: { type: Number, required: true },
    creditSalesRevenueTotal: { type: Number, required: true },//added --------------> 15.02.2021
    retailRevenueTotal: { type: Number, required: true},//changed--------------> 15.02.2021
    salesCost: { type: Number, required: true },
    grossProfitMinusLoss: { type: Number, required: true },//added --------------> 15.02.2021
    bioAssetsProfitLoss: { type: Number, required: true},
    marketingExpenses: { type: Number, required: true },
    administrativeExpenses: { type: Number, required: true },
    otherOperatingRevenue: { type: Number, required: true },
    otherOperatingCharges: { type: Number, required: true },
    earningsMinusLosses: { type: Number, required: true },//added--------------> 15.02.2021
    profitLossSubsidiaries: { type: Number, required: true},
    profitLossAssociated: { type: Number, required: true },
    profitLossFinancialInvestments: { type: Number, required: true },
    interestIncome: { type: Number, required: true },
    interestExpense: { type: Number, required: true },
    otherFinancialIncomeExpenses: { type: Number, required: true },
    earningsMinusLossesBeforeIncomeExpenses: { type: Number, required: true },//added--------------> 15.02.2021
    incomeTaxExpense: { type: Number, required: true },
    financialYearEarningsMinusLosses: { type: Number, required: true }//added--------------> 15.02.2021
});