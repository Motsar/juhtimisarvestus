var sanitize = require("mongo-sanitize");

exports.auth = function (req, res, next) {
    if (req.user) {
        let useridJSON = req.user;
        req.admin = useridJSON.admin;
        req.userId = useridJSON._id;
        next();
    } else {
        res.redirect('/');
    }
}

exports.cleanBody =function(req, res, next){
    req.body = sanitize(req.body);
    next();
  }

exports.notAuth = function (req, res, next) {
    if (!req.user) {
        res.redirect('/');
    } else {
        next();
    }
}

exports.apiAuth = function (req, res, next) {
    if (!req.user) return res.status(403).json({ error: "Te olete välja logitud" });
    let useridJSON = req.user;
    req.userId = useridJSON._id;
    req.admin = useridJSON.admin;
    next();
}

let roundOff = (num, places) => {
    const x = Math.pow(10, places);
    return Math.round(num * x) / x;
}

let absoluteHorizontal = (higher, lower) => {
    return higher - lower;
}

let procentageHorizontal = (higher, lower) => {
    if (higher === 0 && lower === 0) return 0;
    return ((higher - lower) / lower) * 100;
}

let verticalProcentageCalc = (entryLine, entryTotal) => {
    if (entryLine === 0) return 0;
    return (entryLine / entryTotal) * 100;
}

//Lühiajalise maksevõime suhtarvud

    //1.Puhas käibekapital (Net Working capital)
    exports.NetWorkingCapital = (Balances) => {
        let array = []; 
        let i = 0;
        Balances.forEach(balance => {
            let balanceDate = Balances[i].date.getFullYear();
            let balanceYear = balanceDate.toString();
            let NetWorkingCapitalResult = roundOff(balance.totalCurrentAssets - balance.totalCurrentLiabilities, 2);
            array.push({ "year": balanceYear, "netWorkingCapital": NetWorkingCapitalResult });
            i += 1;
        })
        return array;
    }

    //2.Lühiajalise võlgnevuse kattekordaja (Current Ratio)
    exports.CurrentRatio = (balances) => {
        let array = []; 
        let i = 0;
        balances.forEach(balance => {
            let balanceDate = balances[i].date.getFullYear();
            let balanceYear = balanceDate.toString();
            let CurrentRatioResult = roundOff(balance.totalCurrentAssets / balance.totalCurrentLiabilities, 2);
            array.push({ "year": balanceYear, "currentRatio": CurrentRatioResult });
            i += 1;
        })
        return array;
    }

    //3.Likviidsuskordaja  ehk Happetest (Quick Ratio)
    exports.QuickRatio = (balances) => {
        let array = [];
        let i = 0;
        balances.forEach(balance => {
            let balanceDate = balances[i].date.getFullYear();
            let balanceYear = balanceDate.toString();
            let QuickRatioResult = roundOff((balance.totalCurrentAssets - balance.inventories - balance.receivablesPrepayments) / balance.totalCurrentLiabilities, 2);
            array.push({ "year": balanceYear, "quickRatio": QuickRatioResult });
            i += 1;
        })
        return array;
    }

    //4.Kohene maksevalmiduse kordaja (Cash Ratio)
    exports.CashRatio = (balances) => {
        let array = [];
        let i = 0;
        balances.forEach(balance => {
            let balanceDate = balances[i].date.getFullYear();
            let balanceYear = balanceDate.toString();
            let CashRatioResult = roundOff(balance.cash + balance.stInvestments / balance.totalCurrentLiabilities, 2);
            array.push({ "year": balanceYear, "cashRatio": CashRatioResult });
            i += 1;
        })
        return array;
    }

    //Efektiivsuse suhtarvud

    //1.Varade käibekordaja (Total asset turnover)

    exports.totalAssetTurnover = (balances, profitReports) => {
        let array = [];
        let lowerNumber = 0;
        for (let upperNum = 1; upperNum < balances.length; upperNum++) {
            let balanceDate = balances[lowerNumber].date.getFullYear();
            let balanceYear = balanceDate.toString();
            let profitReportsDate = profitReports[lowerNumber].year.getFullYear();
            let profitReportsYear = profitReportsDate.toString();
            if (profitReportsYear === balanceYear) {
                let TotalAssetTurnover = roundOff(profitReports[lowerNumber].salesRevenue / ((balances[lowerNumber].totalAssets + balances[upperNum].totalAssets) / 2), 2);
                array.push({ "year": balanceYear, "totalAssetTurnover": TotalAssetTurnover });
            }
            lowerNumber += 1;
        }
        return array;
    }

    //2.Varade käibevälde (Days assets hold)

    exports.daysAssetsHold = (TotalAssetTurnover,yearLength) => {
        let array = [];
        let totalAssetTurnovers = TotalAssetTurnover;
        for (let i = 0; i < totalAssetTurnovers.length; i++) {
            let DaysAssetsHold = roundOff(yearLength / totalAssetTurnovers[i].totalAssetTurnover, 2);
            array.push({ "year": totalAssetTurnovers[i].year, "DaysAssetsHold": DaysAssetsHold });
        }
        return array;
    }
    
    //3.Põhivarade käibekordaja  (Fixed asset turnover)

    exports.fixedAssetTurnover = (balances,profitReports) => {
        let array = [];
        let lowerNumber = 0;
        for (let upperNum = 1; upperNum < balances.length; upperNum++) {
            let balanceDate = balances[lowerNumber].date.getFullYear();
            let balanceYear = balanceDate.toString();
            let profitReportsDate = profitReports[lowerNumber].year.getFullYear();
            let profitReportsYear = profitReportsDate.toString();
            if (profitReportsYear === balanceYear) {
                let FixedAssetTurnover = roundOff(profitReports[lowerNumber].salesRevenue / ((balances[lowerNumber].totalFixedAssets + balances[upperNum].totalFixedAssets) / 2), 2);
                array.push({ "year": balanceYear, "fixedAssetTurnover": FixedAssetTurnover });
            }
            lowerNumber += 1;
        }
        return array;
    }

    //4. Põhivarade käibevälde  (Days fixed assets hold)

    exports.daysFixedAssetsHold = (fixedAssetTurnovers,yearLength) => {
        let array = [];
        let fixedAssetTurnover = fixedAssetTurnovers;
        for (let i = 0; i < fixedAssetTurnover.length; i++) {
            let daysFixedAssetsHold = roundOff(yearLength / fixedAssetTurnover[i].fixedAssetTurnover, 2);
            array.push({ "year": fixedAssetTurnover[i].year, "DaysFixedAssetsHold": daysFixedAssetsHold });
        }
        return array;
    }
    
    //5. Ostjate debitoorse võlgnevuse käibekordaja  (Accounts receivables turnover)

    exports.accountsReceivablesTurnover = (balances,profitReports,vat_obligatory) => {
        let array = [];
        let lowerNumber = 0;
        for (let upperNum = 1; upperNum < balances.length; upperNum++) {
            let AccountsReceivablesTurnover;
            let balanceDate = balances[lowerNumber].date.getFullYear();
            let balanceYear = balanceDate.toString();
            let profitReportsDate = profitReports[lowerNumber].year.getFullYear();
            let profitReportsYear = profitReportsDate.toString();
            if (profitReportsYear === balanceYear) {
                if (vat_obligatory === "no") {
                    AccountsReceivablesTurnover = roundOff(profitReports[lowerNumber].creditSalesRevenueTotal / (((balances[lowerNumber].stTradeReceivables - balances[lowerNumber].stServicesPrepayments) + (balances[upperNum].stTradeReceivables - balances[upperNum].stServicesPrepayments)) / 2), 2);
                } else {
                    AccountsReceivablesTurnover = roundOff(((profitReports[lowerNumber].creditSalesRevenue0 * 1.0) + (profitReports[lowerNumber].creditSalesRevenue9 * 1.09) + (profitReports[lowerNumber].creditSalesRevenue20 * 1.2)) / (((balances[lowerNumber].stTradeReceivables - balances[lowerNumber].stServicesPrepayments) + (balances[upperNum].stTradeReceivables - balances[upperNum].stServicesPrepayments)) / 2), 2);
                }
                array.push({ "year": balanceYear, "accountsReceivablesTurnover": AccountsReceivablesTurnover });
            }
            lowerNumber += 1;
        }
        return array;
    }
    
    //6.Ostjate debitoorse võlgnevuse käibevälde  (Days sales outstanding)

    exports.daysSalesOutstanding = (AccountsReceivablesTurnovers,yearLength) => {
        let array = [];
        let accountsReceivablesTurnover = AccountsReceivablesTurnovers;
        for (let i = 0; i < accountsReceivablesTurnover.length; i++) {
            let daysSalesOutstanding = roundOff(yearLength / accountsReceivablesTurnover[i].accountsReceivablesTurnover, 2);
            array.push({ "year": accountsReceivablesTurnover[i].year, "daysSalesOutstanding": daysSalesOutstanding });
        }
        return array;
    }

    //7.Varude käibekordaja (Inventory turnover)

    exports.inventoryTurnover = (balances, profitReports, Profit_report_schema) => {
        let array = [];
        let lowerNumber = 0;
        for (let upperNum = 1; upperNum < balances.length; upperNum++) {
            let inventoryTurnover;
            let balanceDate = balances[lowerNumber].date.getFullYear();
            let balanceYear = balanceDate.toString();
            let profitReportsDate = profitReports[lowerNumber].year.getFullYear();
            let profitReportsYear = profitReportsDate.toString();
            if (profitReportsYear === balanceYear) {
                if (Profit_report_schema === 1) {
                    inventoryTurnover = roundOff(profitReports[lowerNumber].salesRevenue / ((balances[lowerNumber].inventories + balances[upperNum].inventories) / 2), 2);
                } else {
                    inventoryTurnover = roundOff(profitReports[lowerNumber].salesCost / ((balances[lowerNumber].inventories + balances[upperNum].inventories) / 2), 2);
                }
                array.push({ "year": balanceYear, "inventoryTurnover": inventoryTurnover });
            }
            lowerNumber += 1;
        }
        return array;
    }

    //8.Varude käibevälde (Days inventory held)

    exports.daysInventoryHeld = (InventoryTurnovers, yearLength) => {
        let array = [];
        let inventoryTurnover = InventoryTurnovers;
        for (let i = 0; i < inventoryTurnover.length; i++) {
            let daysInventoryHeld = roundOff(yearLength / inventoryTurnover[i].inventoryTurnover, 2);
            array.push({ "year": inventoryTurnover[i].year, "daysInventoryHeld": daysInventoryHeld });
        }
        return array;
    }

    //9.Tarnijate lühiajaliste kohustiste käibekordaja (Accounts payable turnover)

    exports.accountsPayableTurnover = (balances,profitReports,Profit_report_schema) => {
        let array = [];
        let lowerNumber = 0;
        for (let upperNum = 1; upperNum < balances.length; upperNum++) {
            let accountsPayableTurnover;
            let balanceDate = balances[lowerNumber].date.getFullYear();
            let balanceYear = balanceDate.toString();
            let profitReportsDate = profitReports[lowerNumber].year.getFullYear();
            let profitReportsYear = profitReportsDate.toString();
            if (profitReportsYear === balanceYear) {
                if (Profit_report_schema === 1) {
                    accountsPayableTurnover = roundOff((profitReports[lowerNumber].salesRevenue * 1.2) / (((balances[lowerNumber].stTradeCreditors - balances[lowerNumber].inventoriesPrepayments) + (balances[upperNum].stTradeCreditors - balances[upperNum].inventoriesPrepayments)) / 2), 2);
                } else {
                    accountsPayableTurnover = roundOff((profitReports[lowerNumber].salesCost * 1.2) / (((balances[lowerNumber].stTradeCreditors - balances[lowerNumber].inventoriesPrepayments) + (balances[upperNum].stTradeCreditors - balances[upperNum].inventoriesPrepayments)) / 2), 2);
                }
                array.push({ "year": balanceYear, "accountsPayableTurnover": accountsPayableTurnover });
            }
            lowerNumber += 1;
        }
        return array;
    }

    //10.Lühiajaliste kohustiste käibevälde (Days accounts payable outstanding)

    exports.daysAccountsPayableOutstanding = (AccountsPayableTurnovers, yearLength) => {
        let array = [];
        let accountsPayableTurnover = AccountsPayableTurnovers;
        for (let i = 0; i < accountsPayableTurnover.length; i++) {
            let daysAccountsPayableOutstanding = roundOff(yearLength / accountsPayableTurnover[i].accountsPayableTurnover, 2);
            array.push({ "year": accountsPayableTurnover[i].year, "daysAccountsPayableOutstanding": daysAccountsPayableOutstanding });
        }
        return array;
    }

    //Tasuvuse suhtarvud

    //1.Koguvara puhasrentaablus ROA (Return on total assets)

    exports.returnOnTotalAssets = (balances, profitReports) => {
        let array = [];
        let lowerNumber = 0;
        for (let upperNum = 1; upperNum < balances.length; upperNum++) {
            let returnOnTotalAssets;
            let balanceDate = balances[lowerNumber].date.getFullYear();
            let balanceYear = balanceDate.toString();
            let profitReportsDate = profitReports[lowerNumber].year.getFullYear();
            let profitReportsYear = profitReportsDate.toString();
            if (profitReportsYear === balanceYear) {
                returnOnTotalAssets = roundOff(((profitReports[lowerNumber].earningsMinusLossesBeforeIncomeExpenses) / ((balances[lowerNumber].totalAssets + balances[upperNum].totalAssets) / 2)) * 100, 2);
                array.push({ "year": balanceYear, "returnOnTotalAssets": returnOnTotalAssets });
            }
            lowerNumber += 1;
        }
        return array;
    }

    //2.Investeeringute rentaablus ROI (return on investment)

    exports.returnOnInvestment = (balances, profitReports) => {
        let array=[];
        let lowerNumber = 0;
        for (let upperNum = 1; upperNum < balances.length; upperNum++) {
            let returnOnInvestment;
            let balanceDate = balances[lowerNumber].date.getFullYear();
            let balanceYear = balanceDate.toString();
            let profitReportsDate = profitReports[lowerNumber].year.getFullYear();
            let profitReportsYear = profitReportsDate.toString();
            if (profitReportsYear === balanceYear) {
                let calculations = roundOff(((profitReports[lowerNumber].earningsMinusLosses) / ((balances[lowerNumber].totalAssets + balances[upperNum].totalAssets) / 2)) * 100, 2);
                if(calculations===undefined){
                    returnOnInvestment=0;
                }else{
                    returnOnInvestment=calculations;
                }
                array.push({ "year": balanceYear, "returnOnInvestment": returnOnInvestment });
            }
            lowerNumber += 1;
        }
        return array;
    }

    //3.Omakapitali rentaablus ROE (return on equity)

    exports.roeOnEquity = (balances, profitReports) => {
        let array=[];
        for (let i = 0; i < balances.length; i++) {
            let balanceDate = balances[i].date.getFullYear();
            let balanceYear = balanceDate.toString();
            let profitReportsDate = profitReports[i].year.getFullYear();
            let profitReportsYear = profitReportsDate.toString();
            if (profitReportsYear === balanceYear) {
                let roeOnEquity = roundOff((profitReports[i].financialYearEarningsMinusLosses / balances[i].totalAssets) * 100, 2);
                array.push({ "year": balanceYear, "roeOnEquity": roeOnEquity });
            }
        }
        return array;
    }

    //4.Müügikäibe puhasrentaablus ROS (return on sales)
    //(Puhaskasum/müügitulu)*100

    exports.roeOnSales = (profitReports) => {
        let array=[];
        for (let i = 0; i < profitReports.length; i++) {
            let profitReportsDate = profitReports[i].year.getFullYear();
            let profitReportsYear = profitReportsDate.toString();
            let roeOnSales = roundOff((profitReports[i].financialYearEarningsMinusLosses / profitReports[i].salesRevenue) * 100, 2);
            array.push({ "year": profitReportsYear, "roeOnSales": roeOnSales });
        }
        return array;
    }

    //5.Müügikäibe brutorentaablus (Gross Profit Margin)
    //(Brurokasum/müügitulu)*100 grossProfitMinusLoss

    exports.grossProfitMargin = (profitReports,Profit_report_schema) => {
        let array=[];
        if (Profit_report_schema === 2) {
            for (let i = 0; i < profitReports.length; i++) {
                let profitReportsDate = profitReports[i].year.getFullYear();
                let profitReportsYear = profitReportsDate.toString();
                let grossProfitMargin = roundOff((profitReports[i].grossProfitMinusLoss / profitReports[i].salesRevenue) * 100, 2);
                array.push({ "year": profitReportsYear, "grossProfitMargin": grossProfitMargin });
            }
        }
        return array;
    }

    //6.Müügikäibe ärirentaablus (Operating Profit Margin)
    //(Ärikasum/müügitulu)*100 profitReports[i].financialYearEarningsMinusLosses

    exports.operatingProfitMargin = (profitReports) => {
        let array=[];
        for (let i = 0; i < profitReports.length; i++) {
            let profitReportsDate = profitReports[i].year.getFullYear();
            let profitReportsYear = profitReportsDate.toString();
            let operatingProfitMargin = roundOff((profitReports[i].financialYearEarningsMinusLosses / profitReports[i].salesRevenue) * 100, 2);
            array.push({ "year": profitReportsYear, "operatingProfitMargin": operatingProfitMargin });
        }
        return array;
    }


    //Pikaajal maksevõime suhtarvud

    //1.Võlakordaja ehk võlakoormus (Total debt Ratio)
    //(Kohustised/Aktiva kokku)*100
    //(totalLiabilities/totalAssets)*100
    exports.totalDeptRatio = (balances) => {
        let array=[];
        for (let i = 0; i < balances.length; i++) {
            let balanceDate = balances[i].date.getFullYear();
            let balanceYear = balanceDate.toString();
            let totalDeptRatio = roundOff((balances[i].totalLiabilities / balances[i].totalAssets) * 100, 2);
            array.push({ "year": balanceYear, "totalDeptRatio": totalDeptRatio });
        }
        return array;
    }

    //2.Soliidsuskordaja (Solidity, equity ratio)
    //(omakapital/passiva kokku)*100
    //(ownersEquityTotal/totalLiabilitiesOwnersEquity)+100

    exports.solidityEquityRatio = (balances) => {
        let array=[];
        for (let i = 0; i < balances.length; i++) {
            let balanceDate = balances[i].date.getFullYear();
            let balanceYear = balanceDate.toString();
            let solidityEquityRatio = roundOff((balances[i].ownersEquityTotal / balances[i].totalLiabilitiesOwnersEquity) * 100, 2);
            array.push({ "year": balanceYear, "solidityEquityRatio": solidityEquityRatio });
        }
        return array;
    }

    //3.Kapitaliseerituse kordaja (Long-term debt ratio)
    //(Pikaajalised kohustised/(pikajalised kohustised +omakapital)
    //(ltLiabilitiesTotal/(ltLiabilitiesTotal+ownersEquityTotal))

    exports.ltDebtRatio = (balances) => {
        let array=[];
        for (let i = 0; i < balances.length; i++) {
            let balanceDate = balances[i].date.getFullYear();
            let balanceYear = balanceDate.toString();
            let ltDebtRatio = roundOff(balances[i].ltLiabilitiesTotal / (balances[i].ltLiabilitiesTotal + balances[i].ownersEquityTotal), 2);
            array.push({ "year": balanceYear, "ltDebtRatio": ltDebtRatio });
        }
        return array;
    }

    //Balances horizontal analysis

    exports.horizontalAnalysisBalances = (balances) => {
        let array=[];
        let lowerNumber = 0;
        for (let upperNum = 1; upperNum < balances.length; upperNum++){
            let balanceDate = balances[lowerNumber].date.getFullYear();
            let balanceYear = balanceDate.toString();
            array.push({
                "year": balanceYear,
                "cash": [balances[lowerNumber].cash, absoluteHorizontal(balances[upperNum].cash, balances[lowerNumber].cash), roundOff(procentageHorizontal(balances[upperNum].cash, balances[lowerNumber].cash), 2)],
                "stInvestments": [balances[lowerNumber].stInvestments, absoluteHorizontal(balances[upperNum].stInvestments, balances[lowerNumber].stInvestments), roundOff(procentageHorizontal(balances[upperNum].stInvestments, balances[lowerNumber].stInvestments), 2)],
                "receivablesPrepayments": [balances[lowerNumber].receivablesPrepayments, absoluteHorizontal(balances[upperNum].receivablesPrepayments, balances[lowerNumber].receivablesPrepayments), roundOff(procentageHorizontal(balances[upperNum].receivablesPrepayments, balances[lowerNumber].receivablesPrepayments), 2)],
                "inventories": [balances[lowerNumber].inventories, absoluteHorizontal(balances[upperNum].inventories, balances[lowerNumber].inventories), roundOff(procentageHorizontal(balances[upperNum].inventories, balances[lowerNumber].inventories), 2)],
                "stBiologicalAssets": [balances[lowerNumber].stBiologicalAssets, absoluteHorizontal(balances[upperNum].stBiologicalAssets, balances[lowerNumber].stBiologicalAssets), roundOff(procentageHorizontal(balances[upperNum].stBiologicalAssets, balances[lowerNumber].stBiologicalAssets), 2)],
                "totalCurrentAssets": [balances[lowerNumber].totalCurrentAssets, absoluteHorizontal(balances[upperNum].totalCurrentAssets, balances[lowerNumber].totalCurrentAssets), roundOff(procentageHorizontal(balances[upperNum].totalCurrentAssets, balances[lowerNumber].totalCurrentAssets), 2)],
                "investmentsSubUnder": [balances[lowerNumber].investmentsSubUnder, absoluteHorizontal(balances[upperNum].investmentsSubUnder, balances[lowerNumber].investmentsSubUnder), roundOff(procentageHorizontal(balances[upperNum].investmentsSubUnder, balances[lowerNumber].investmentsSubUnder), 2)],
                "ltInvestments": [balances[lowerNumber].ltInvestments, absoluteHorizontal(balances[upperNum].ltInvestments, balances[lowerNumber].ltInvestments), roundOff(procentageHorizontal(balances[upperNum].ltInvestments, balances[lowerNumber].ltInvestments), 2)],
                "ltReceivablesPrepayments": [balances[lowerNumber].ltReceivablesPrepayments, absoluteHorizontal(balances[upperNum].ltReceivablesPrepayments, balances[lowerNumber].ltReceivablesPrepayments), roundOff(procentageHorizontal(balances[upperNum].ltReceivablesPrepayments, balances[lowerNumber].ltReceivablesPrepayments), 2)],
                "realEstateInv": [balances[lowerNumber].realEstateInv, absoluteHorizontal(balances[upperNum].realEstateInv, balances[lowerNumber].realEstateInv), roundOff(procentageHorizontal(balances[upperNum].realEstateInv, balances[lowerNumber].realEstateInv), 2)],
                "tangibleAssets": [balances[lowerNumber].tangibleAssets, absoluteHorizontal(balances[upperNum].tangibleAssets, balances[lowerNumber].tangibleAssets), roundOff(procentageHorizontal(balances[upperNum].tangibleAssets, balances[lowerNumber].tangibleAssets), 2)],
                "ltBiologicalAssets": [balances[lowerNumber].ltBiologicalAssets, absoluteHorizontal(balances[upperNum].ltBiologicalAssets, balances[lowerNumber].ltBiologicalAssets), roundOff(procentageHorizontal(balances[upperNum].ltBiologicalAssets, balances[lowerNumber].ltBiologicalAssets), 2)],
                "intangibleFixedAssets": [balances[lowerNumber].intangibleFixedAssets, absoluteHorizontal(balances[upperNum].intangibleFixedAssets, balances[lowerNumber].intangibleFixedAssets), roundOff(procentageHorizontal(balances[upperNum].intangibleFixedAssets, balances[lowerNumber].intangibleFixedAssets), 2)],
                "totalFixedAssets": [balances[lowerNumber].totalFixedAssets, absoluteHorizontal(balances[upperNum].totalFixedAssets, balances[lowerNumber].totalFixedAssets), roundOff(procentageHorizontal(balances[upperNum].totalFixedAssets, balances[lowerNumber].totalFixedAssets), 2)],
                "totalAssets": [balances[lowerNumber].totalAssets, absoluteHorizontal(balances[upperNum].totalAssets, balances[lowerNumber].totalAssets), roundOff(procentageHorizontal(balances[upperNum].totalAssets, balances[lowerNumber].totalAssets), 2)],
                "stLoanLiabilities": [balances[lowerNumber].stLoanLiabilities, absoluteHorizontal(balances[upperNum].stLoanLiabilities, balances[lowerNumber].stLoanLiabilities), roundOff(procentageHorizontal(balances[upperNum].stLoanLiabilities, balances[lowerNumber].stLoanLiabilities), 2)],
                "debtsPrepaymentsReceived": [balances[lowerNumber].debtsPrepaymentsReceived, absoluteHorizontal(balances[upperNum].debtsPrepaymentsReceived, balances[lowerNumber].debtsPrepaymentsReceived), roundOff(procentageHorizontal(balances[upperNum].debtsPrepaymentsReceived, balances[lowerNumber].debtsPrepaymentsReceived), 2)],
                "stProvisions": [balances[lowerNumber].stProvisions, absoluteHorizontal(balances[upperNum].stProvisions, balances[lowerNumber].stProvisions), roundOff(procentageHorizontal(balances[upperNum].stProvisions, balances[lowerNumber].stProvisions), 2)],
                "stTargetedFinancings": [balances[lowerNumber].stTargetedFinancings, absoluteHorizontal(balances[upperNum].stTargetedFinancings, balances[lowerNumber].stTargetedFinancings), roundOff(procentageHorizontal(balances[upperNum].stTargetedFinancings, balances[lowerNumber].stTargetedFinancings), 2)],
                "totalCurrentLiabilities": [balances[lowerNumber].totalCurrentLiabilities, absoluteHorizontal(balances[upperNum].totalCurrentLiabilities, balances[lowerNumber].totalCurrentLiabilities), roundOff(procentageHorizontal(balances[upperNum].totalCurrentLiabilities, balances[lowerNumber].totalCurrentLiabilities), 2)],
                "ltLoanLiabilities": [balances[lowerNumber].ltLoanLiabilities, absoluteHorizontal(balances[upperNum].ltLoanLiabilities, balances[lowerNumber].ltLoanLiabilities), roundOff(procentageHorizontal(balances[upperNum].ltLoanLiabilities, balances[lowerNumber].ltLoanLiabilities), 2)],
                "ltDebtsPrepayments": [balances[lowerNumber].ltDebtsPrepayments, absoluteHorizontal(balances[upperNum].ltDebtsPrepayments, balances[lowerNumber].ltDebtsPrepayments), roundOff(procentageHorizontal(balances[upperNum].ltDebtsPrepayments, balances[lowerNumber].ltDebtsPrepayments), 2)],
                "ltProvisions": [balances[lowerNumber].ltProvisions, absoluteHorizontal(balances[upperNum].ltProvisions, balances[lowerNumber].ltProvisions), roundOff(procentageHorizontal(balances[upperNum].ltProvisions, balances[lowerNumber].ltProvisions), 2)],
                "ltTargetedFinancings": [balances[lowerNumber].ltTargetedFinancings, absoluteHorizontal(balances[upperNum].ltTargetedFinancings, balances[lowerNumber].ltTargetedFinancings), roundOff(procentageHorizontal(balances[upperNum].ltTargetedFinancings, balances[lowerNumber].ltTargetedFinancings), 2)],
                "ltLiabilitiesTotal": [balances[lowerNumber].ltLiabilitiesTotal, absoluteHorizontal(balances[upperNum].ltLiabilitiesTotal, balances[lowerNumber].ltLiabilitiesTotal), roundOff(procentageHorizontal(balances[upperNum].ltLiabilitiesTotal, balances[lowerNumber].ltLiabilitiesTotal), 2)],
                "totalLiabilities": [balances[lowerNumber].totalLiabilities, absoluteHorizontal(balances[upperNum].totalLiabilities, balances[lowerNumber].totalLiabilities), roundOff(procentageHorizontal(balances[upperNum].totalLiabilities, balances[lowerNumber].totalLiabilities), 2)],
                "shareCapital": [balances[lowerNumber].shareCapital, absoluteHorizontal(balances[upperNum].shareCapital, balances[lowerNumber].shareCapital), roundOff(procentageHorizontal(balances[upperNum].shareCapital, balances[lowerNumber].shareCapital), 2)],
                "unregisteredShare": [balances[lowerNumber].unregisteredShare, absoluteHorizontal(balances[upperNum].unregisteredShare, balances[lowerNumber].unregisteredShare), roundOff(procentageHorizontal(balances[upperNum].unregisteredShare, balances[lowerNumber].unregisteredShare), 2)],
                "unpaidShareCapital": [balances[lowerNumber].unpaidShareCapital, absoluteHorizontal(balances[upperNum].unpaidShareCapital, balances[lowerNumber].unpaidShareCapital), roundOff(procentageHorizontal(balances[upperNum].unpaidShareCapital, balances[lowerNumber].unpaidShareCapital), 2)],
                "sharePremium": [balances[lowerNumber].sharePremium, absoluteHorizontal(balances[upperNum].sharePremium, balances[lowerNumber].sharePremium), roundOff(procentageHorizontal(balances[upperNum].sharePremium, balances[lowerNumber].sharePremium), 2)],
                "lessOwnShares": [balances[lowerNumber].lessOwnShares, absoluteHorizontal(balances[upperNum].lessOwnShares, balances[lowerNumber].lessOwnShares), roundOff(procentageHorizontal(balances[upperNum].lessOwnShares, balances[lowerNumber].lessOwnShares), 2)],
                "legalReserve": [balances[lowerNumber].legalReserve, absoluteHorizontal(balances[upperNum].legalReserve, balances[lowerNumber].legalReserve), roundOff(procentageHorizontal(balances[upperNum].legalReserve, balances[lowerNumber].legalReserve), 2)],
                "otherReserves": [balances[lowerNumber].otherReserves, absoluteHorizontal(balances[upperNum].otherReserves, balances[lowerNumber].otherReserves), roundOff(procentageHorizontal(balances[upperNum].otherReserves, balances[lowerNumber].otherReserves), 2)],
                "otherOwnersEquity": [balances[lowerNumber].otherOwnersEquity, absoluteHorizontal(balances[upperNum].otherOwnersEquity, balances[lowerNumber].otherOwnersEquity), roundOff(procentageHorizontal(balances[upperNum].otherOwnersEquity, balances[lowerNumber].otherOwnersEquity), 2)],
                "retainedProfitLoss": [balances[lowerNumber].retainedProfitLoss, absoluteHorizontal(balances[upperNum].retainedProfitLoss, balances[lowerNumber].retainedProfitLoss), roundOff(procentageHorizontal(balances[upperNum].retainedProfitLoss, balances[lowerNumber].retainedProfitLoss), 2)],
                "financialYearNetProfitLoss": [balances[lowerNumber].financialYearNetProfitLoss, absoluteHorizontal(balances[upperNum].financialYearNetProfitLoss, balances[lowerNumber].financialYearNetProfitLoss), roundOff(procentageHorizontal(balances[upperNum].financialYearNetProfitLoss, balances[lowerNumber].financialYearNetProfitLoss), 2)],
                "ownersEquityTotal": [balances[lowerNumber].ownersEquityTotal, absoluteHorizontal(balances[upperNum].ownersEquityTotal, balances[lowerNumber].ownersEquityTotal), roundOff(procentageHorizontal(balances[upperNum].ownersEquityTotal, balances[lowerNumber].ownersEquityTotal), 2)],
                "totalLiabilitiesOwnersEquity": [balances[lowerNumber].totalLiabilitiesOwnersEquity, absoluteHorizontal(balances[upperNum].totalLiabilitiesOwnersEquity, balances[lowerNumber].totalLiabilitiesOwnersEquity), roundOff(procentageHorizontal(balances[upperNum].totalLiabilitiesOwnersEquity, balances[lowerNumber].totalLiabilitiesOwnersEquity), 2)]
            });
            lowerNumber += 1;
        }
        return array;
    }

    //Profit Reports horizontal analysis

    exports.horizontalAnalysisProfitReps = (profitReports,Profit_report_schema) => {
        let array=[];
        let lowerNumber = 0;
        for (let upperNum = 1; upperNum < profitReports.length; upperNum++) {
            let profitReportsDate = profitReports[lowerNumber].year.getFullYear();
            let profitReportsYear = profitReportsDate.toString();
            if (Profit_report_schema === 1) {
                array.push({
                    "year": profitReportsYear,
                    "salesRevenue": [profitReports[lowerNumber].salesRevenue, absoluteHorizontal(profitReports[upperNum].salesRevenue, profitReports[lowerNumber].salesRevenue), roundOff(procentageHorizontal(profitReports[upperNum].salesRevenue, profitReports[lowerNumber].salesRevenue), 2)],
                    "creditSalesRevenueTotal": [profitReports[lowerNumber].creditSalesRevenueTotal, absoluteHorizontal(profitReports[upperNum].creditSalesRevenueTotal, profitReports[lowerNumber].creditSalesRevenueTotal), roundOff(procentageHorizontal(profitReports[upperNum].creditSalesRevenueTotal, profitReports[lowerNumber].creditSalesRevenueTotal), 2)],
                    "otherOperatingRevenue": [profitReports[lowerNumber].otherOperatingRevenue, absoluteHorizontal(profitReports[upperNum].otherOperatingRevenue, profitReports[lowerNumber].otherOperatingRevenue), roundOff(procentageHorizontal(profitReports[upperNum].otherOperatingRevenue, profitReports[lowerNumber].otherOperatingRevenue), 2)],
                    "agriGoodsWip": [profitReports[lowerNumber].agriGoodsWip, absoluteHorizontal(profitReports[upperNum].agriGoodsWip, profitReports[lowerNumber].agriGoodsWip), roundOff(procentageHorizontal(profitReports[upperNum].agriGoodsWip, profitReports[lowerNumber].agriGoodsWip), 2)],
                    "bioAssetsProfitLoss": [profitReports[lowerNumber].bioAssetsProfitLoss, absoluteHorizontal(profitReports[upperNum].bioAssetsProfitLoss, profitReports[lowerNumber].bioAssetsProfitLoss), roundOff(procentageHorizontal(profitReports[upperNum].bioAssetsProfitLoss, profitReports[lowerNumber].bioAssetsProfitLoss), 2)],
                    "changesGoodsWip": [profitReports[lowerNumber].changesGoodsWip, absoluteHorizontal(profitReports[upperNum].changesGoodsWip, profitReports[lowerNumber].changesGoodsWip), roundOff(procentageHorizontal(profitReports[upperNum].changesGoodsWip, profitReports[lowerNumber].changesGoodsWip), 2)],
                    "ownPurposeCapitalised": [profitReports[lowerNumber].ownPurposeCapitalised, absoluteHorizontal(profitReports[upperNum].ownPurposeCapitalised, profitReports[lowerNumber].ownPurposeCapitalised), roundOff(procentageHorizontal(profitReports[upperNum].ownPurposeCapitalised, profitReports[lowerNumber].ownPurposeCapitalised), 2)],
                    "goodsRawMaterialsServices": [profitReports[lowerNumber].goodsRawMaterialsServices, absoluteHorizontal(profitReports[upperNum].goodsRawMaterialsServices, profitReports[lowerNumber].goodsRawMaterialsServices), roundOff(procentageHorizontal(profitReports[upperNum].goodsRawMaterialsServices, profitReports[lowerNumber].goodsRawMaterialsServices), 2)],
                    "otherOperatingExpenses": [profitReports[lowerNumber].otherOperatingExpenses, absoluteHorizontal(profitReports[upperNum].otherOperatingExpenses, profitReports[lowerNumber].otherOperatingExpenses), roundOff(procentageHorizontal(profitReports[upperNum].otherOperatingExpenses, profitReports[lowerNumber].otherOperatingExpenses), 2)],
                    "wagesSalaries": [profitReports[lowerNumber].wagesSalaries, absoluteHorizontal(profitReports[upperNum].wagesSalaries, profitReports[lowerNumber].wagesSalaries), roundOff(procentageHorizontal(profitReports[upperNum].wagesSalaries, profitReports[lowerNumber].wagesSalaries), 2)],
                    "fixedAssetsDepreciationImpairment": [profitReports[lowerNumber].fixedAssetsDepreciationImpairment, absoluteHorizontal(profitReports[upperNum].fixedAssetsDepreciationImpairment, profitReports[lowerNumber].fixedAssetsDepreciationImpairment), roundOff(procentageHorizontal(profitReports[upperNum].fixedAssetsDepreciationImpairment, profitReports[lowerNumber].fixedAssetsDepreciationImpairment), 2)],
                    "currentAssetsDiscounts": [profitReports[lowerNumber].currentAssetsDiscounts, absoluteHorizontal(profitReports[upperNum].currentAssetsDiscounts, profitReports[lowerNumber].currentAssetsDiscounts), roundOff(procentageHorizontal(profitReports[upperNum].currentAssetsDiscounts, profitReports[lowerNumber].currentAssetsDiscounts), 2)],
                    "otherOperatingCharges": [profitReports[lowerNumber].otherOperatingCharges, absoluteHorizontal(profitReports[upperNum].otherOperatingCharges, profitReports[lowerNumber].otherOperatingCharges), roundOff(procentageHorizontal(profitReports[upperNum].otherOperatingCharges, profitReports[lowerNumber].otherOperatingCharges), 2)],
                    "earningsMinusLosses": [profitReports[lowerNumber].earningsMinusLosses, absoluteHorizontal(profitReports[upperNum].earningsMinusLosses, profitReports[lowerNumber].earningsMinusLosses), roundOff(procentageHorizontal(profitReports[upperNum].earningsMinusLosses, profitReports[lowerNumber].earningsMinusLosses), 2)],
                    "profitLossSubsidiaries": [profitReports[lowerNumber].profitLossSubsidiaries, absoluteHorizontal(profitReports[upperNum].profitLossSubsidiaries, profitReports[lowerNumber].profitLossSubsidiaries), roundOff(procentageHorizontal(profitReports[upperNum].profitLossSubsidiaries, profitReports[lowerNumber].profitLossSubsidiaries), 2)],
                    "profitLossAssociated": [profitReports[lowerNumber].profitLossAssociated, absoluteHorizontal(profitReports[upperNum].profitLossAssociated, profitReports[lowerNumber].profitLossAssociated), roundOff(procentageHorizontal(profitReports[upperNum].profitLossAssociated, profitReports[lowerNumber].profitLossAssociated), 2)],
                    "profitLossFinancialInvestments": [profitReports[lowerNumber].profitLossFinancialInvestments, absoluteHorizontal(profitReports[upperNum].profitLossFinancialInvestments, profitReports[lowerNumber].profitLossFinancialInvestments), roundOff(procentageHorizontal(profitReports[upperNum].profitLossFinancialInvestments, profitReports[lowerNumber].profitLossFinancialInvestments), 2)],
                    "interestIncome": [profitReports[lowerNumber].interestIncome, absoluteHorizontal(profitReports[upperNum].interestIncome, profitReports[lowerNumber].interestIncome), roundOff(procentageHorizontal(profitReports[upperNum].interestIncome, profitReports[lowerNumber].interestIncome), 2)],
                    "interestExpense": [profitReports[lowerNumber].interestExpense, absoluteHorizontal(profitReports[upperNum].interestExpense, profitReports[lowerNumber].interestExpense), roundOff(procentageHorizontal(profitReports[upperNum].interestExpense, profitReports[lowerNumber].interestExpense), 2)],
                    "otherFinancialIncomeExpenses": [profitReports[lowerNumber].otherFinancialIncomeExpenses, absoluteHorizontal(profitReports[upperNum].otherFinancialIncomeExpenses, profitReports[lowerNumber].otherFinancialIncomeExpenses), roundOff(procentageHorizontal(profitReports[upperNum].otherFinancialIncomeExpenses, profitReports[lowerNumber].otherFinancialIncomeExpenses), 2)],
                    "earningsMinusLossesBeforeIncomeExpenses": [profitReports[lowerNumber].earningsMinusLossesBeforeIncomeExpenses, absoluteHorizontal(profitReports[upperNum].earningsMinusLossesBeforeIncomeExpenses, profitReports[lowerNumber].earningsMinusLossesBeforeIncomeExpenses), roundOff(procentageHorizontal(profitReports[upperNum].earningsMinusLossesBeforeIncomeExpenses, profitReports[lowerNumber].earningsMinusLossesBeforeIncomeExpenses), 2)],
                    "incomeTaxExpense": [profitReports[lowerNumber].incomeTaxExpense, absoluteHorizontal(profitReports[upperNum].incomeTaxExpense, profitReports[lowerNumber].incomeTaxExpense), roundOff(procentageHorizontal(profitReports[upperNum].incomeTaxExpense, profitReports[lowerNumber].incomeTaxExpense), 2)],
                    "financialYearEarningsMinusLosses": [profitReports[lowerNumber].financialYearEarningsMinusLosses, absoluteHorizontal(profitReports[upperNum].financialYearEarningsMinusLosses, profitReports[lowerNumber].financialYearEarningsMinusLosses), roundOff(procentageHorizontal(profitReports[upperNum].financialYearEarningsMinusLosses, profitReports[lowerNumber].financialYearEarningsMinusLosses), 2)]
                });
            } else {
                array.push({
                    "year": profitReportsYear,
                    "salesRevenue": [profitReports[lowerNumber].salesRevenue, absoluteHorizontal(profitReports[upperNum].salesRevenue, profitReports[lowerNumber].salesRevenue), roundOff(procentageHorizontal(profitReports[upperNum].salesRevenue, profitReports[lowerNumber].salesRevenue), 2)],
                    "creditSalesRevenueTotal": [profitReports[lowerNumber].creditSalesRevenueTotal, absoluteHorizontal(profitReports[upperNum].creditSalesRevenueTotal, profitReports[lowerNumber].creditSalesRevenueTotal), roundOff(procentageHorizontal(profitReports[upperNum].creditSalesRevenueTotal, profitReports[lowerNumber].creditSalesRevenueTotal), 2)],
                    "salesCost": [profitReports[lowerNumber].salesCost, absoluteHorizontal(profitReports[upperNum].salesCost, profitReports[lowerNumber].salesCost), roundOff(procentageHorizontal(profitReports[upperNum].salesCost, profitReports[lowerNumber].salesCost), 2)],
                    "grossProfitMinusLoss": [profitReports[lowerNumber].grossProfitMinusLoss, absoluteHorizontal(profitReports[upperNum].grossProfitMinusLoss, profitReports[lowerNumber].grossProfitMinusLoss), roundOff(procentageHorizontal(profitReports[upperNum].grossProfitMinusLoss, profitReports[lowerNumber].grossProfitMinusLoss), 2)],
                    "bioAssetsProfitLoss": [profitReports[lowerNumber].bioAssetsProfitLoss, absoluteHorizontal(profitReports[upperNum].bioAssetsProfitLoss, profitReports[lowerNumber].bioAssetsProfitLoss), roundOff(procentageHorizontal(profitReports[upperNum].bioAssetsProfitLoss, profitReports[lowerNumber].bioAssetsProfitLoss), 2)],
                    "marketingExpenses": [profitReports[lowerNumber].marketingExpenses, absoluteHorizontal(profitReports[upperNum].marketingExpenses, profitReports[lowerNumber].marketingExpenses), roundOff(procentageHorizontal(profitReports[upperNum].marketingExpenses, profitReports[lowerNumber].marketingExpenses), 2)],
                    "administrativeExpenses": [profitReports[lowerNumber].administrativeExpenses, absoluteHorizontal(profitReports[upperNum].administrativeExpenses, profitReports[lowerNumber].administrativeExpenses), roundOff(procentageHorizontal(profitReports[upperNum].administrativeExpenses, profitReports[lowerNumber].administrativeExpenses), 2)],
                    "otherOperatingRevenue": [profitReports[lowerNumber].otherOperatingRevenue, absoluteHorizontal(profitReports[upperNum].otherOperatingRevenue, profitReports[lowerNumber].otherOperatingRevenue), roundOff(procentageHorizontal(profitReports[upperNum].otherOperatingRevenue, profitReports[lowerNumber].otherOperatingRevenue), 2)],
                    "otherOperatingCharges": [profitReports[lowerNumber].otherOperatingCharges, absoluteHorizontal(profitReports[upperNum].otherOperatingCharges, profitReports[lowerNumber].otherOperatingCharges), roundOff(procentageHorizontal(profitReports[upperNum].otherOperatingCharges, profitReports[lowerNumber].otherOperatingCharges), 2)],
                    "earningsMinusLosses": [profitReports[lowerNumber].earningsMinusLosses, absoluteHorizontal(profitReports[upperNum].earningsMinusLosses, profitReports[lowerNumber].earningsMinusLosses), roundOff(procentageHorizontal(profitReports[upperNum].earningsMinusLosses, profitReports[lowerNumber].earningsMinusLosses), 2)],
                    "profitLossSubsidiaries": [profitReports[lowerNumber].profitLossSubsidiaries, absoluteHorizontal(profitReports[upperNum].profitLossSubsidiaries, profitReports[lowerNumber].profitLossSubsidiaries), roundOff(procentageHorizontal(profitReports[upperNum].profitLossSubsidiaries, profitReports[lowerNumber].profitLossSubsidiaries), 2)],
                    "profitLossAssociated": [profitReports[lowerNumber].profitLossAssociated, absoluteHorizontal(profitReports[upperNum].profitLossAssociated, profitReports[lowerNumber].profitLossAssociated), roundOff(procentageHorizontal(profitReports[upperNum].profitLossAssociated, profitReports[lowerNumber].profitLossAssociated), 2)],
                    "profitLossFinancialInvestments": [profitReports[lowerNumber].profitLossFinancialInvestments, absoluteHorizontal(profitReports[upperNum].profitLossFinancialInvestments, profitReports[lowerNumber].profitLossFinancialInvestments), roundOff(procentageHorizontal(profitReports[upperNum].profitLossFinancialInvestments, profitReports[lowerNumber].profitLossFinancialInvestments), 2)],
                    "interestIncome": [profitReports[lowerNumber].interestIncome, absoluteHorizontal(profitReports[upperNum].interestIncome, profitReports[lowerNumber].interestIncome), roundOff(procentageHorizontal(profitReports[upperNum].interestIncome, profitReports[lowerNumber].interestIncome), 2)],
                    "interestExpense": [profitReports[lowerNumber].interestExpense, absoluteHorizontal(profitReports[upperNum].interestExpense, profitReports[lowerNumber].interestExpense), roundOff(procentageHorizontal(profitReports[upperNum].interestExpense, profitReports[lowerNumber].interestExpense), 2)],
                    "otherFinancialIncomeExpenses": [profitReports[lowerNumber].otherFinancialIncomeExpenses, absoluteHorizontal(profitReports[upperNum].otherFinancialIncomeExpenses, profitReports[lowerNumber].otherFinancialIncomeExpenses), roundOff(procentageHorizontal(profitReports[upperNum].otherFinancialIncomeExpenses, profitReports[lowerNumber].otherFinancialIncomeExpenses), 2)],
                    "earningsMinusLossesBeforeIncomeExpenses": [profitReports[lowerNumber].earningsMinusLossesBeforeIncomeExpenses, absoluteHorizontal(profitReports[upperNum].earningsMinusLossesBeforeIncomeExpenses, profitReports[lowerNumber].earningsMinusLossesBeforeIncomeExpenses), roundOff(procentageHorizontal(profitReports[upperNum].earningsMinusLossesBeforeIncomeExpenses, profitReports[lowerNumber].earningsMinusLossesBeforeIncomeExpenses), 2)],
                    "incomeTaxExpense": [profitReports[lowerNumber].incomeTaxExpense, absoluteHorizontal(profitReports[upperNum].incomeTaxExpense, profitReports[lowerNumber].incomeTaxExpense), roundOff(procentageHorizontal(profitReports[upperNum].incomeTaxExpense, profitReports[lowerNumber].incomeTaxExpense), 2)],
                    "financialYearEarningsMinusLosses": [profitReports[lowerNumber].financialYearEarningsMinusLosses, absoluteHorizontal(profitReports[upperNum].financialYearEarningsMinusLosses, profitReports[lowerNumber].financialYearEarningsMinusLosses), roundOff(procentageHorizontal(profitReports[upperNum].financialYearEarningsMinusLosses, profitReports[lowerNumber].financialYearEarningsMinusLosses), 2)]
                });
            }

            lowerNumber += 1;
        }
        return array;
    }

    //Balance vertical analysis

    exports.verticalAnalysisBalances = (balances) => {
        let array=[];
        for (let i = 0; i < balances.length; i++) {
            let balanceDate = balances[i].date.getFullYear();
            let balanceYear = balanceDate.toString();
            array.push({
                "year": balanceYear,
                "cash": [balances[i].cash, roundOff(verticalProcentageCalc(balances[i].cash, balances[i].totalAssets), 2)],
                "stInvestments": [balances[i].stInvestments, roundOff(verticalProcentageCalc(balances[i].stInvestments, balances[i].totalAssets), 2)],
                "receivablesPrepayments": [balances[i].receivablesPrepayments, roundOff(verticalProcentageCalc(balances[i].receivablesPrepayments, balances[i].totalAssets), 2)],
                "inventories": [balances[i].inventories, roundOff(verticalProcentageCalc(balances[i].inventories, balances[i].totalAssets), 2)],
                "stBiologicalAssets": [balances[i].stBiologicalAssets, roundOff(verticalProcentageCalc(balances[i].stBiologicalAssets, balances[i].totalAssets), 2)],
                "totalCurrentAssets": [balances[i].totalCurrentAssets, roundOff(verticalProcentageCalc(balances[i].totalCurrentAssets, balances[i].totalAssets), 2)],
                "investmentsSubUnder": [balances[i].investmentsSubUnder, roundOff(verticalProcentageCalc(balances[i].investmentsSubUnder, balances[i].totalAssets), 2)],
                "ltInvestments": [balances[i].ltInvestments, roundOff(verticalProcentageCalc(balances[i].ltInvestments, balances[i].totalAssets), 2)],
                "ltReceivablesPrepayments": [balances[i].ltReceivablesPrepayments, roundOff(verticalProcentageCalc(balances[i].ltReceivablesPrepayments, balances[i].totalAssets), 2)],
                "realEstateInv": [balances[i].realEstateInv, roundOff(verticalProcentageCalc(balances[i].realEstateInv, balances[i].totalAssets), 2)],
                "tangibleAssets": [balances[i].tangibleAssets, roundOff(verticalProcentageCalc(balances[i].tangibleAssets, balances[i].totalAssets), 2)],
                "ltBiologicalAssets": [balances[i].ltBiologicalAssets, roundOff(verticalProcentageCalc(balances[i].ltBiologicalAssets, balances[i].totalAssets), 2)],
                "intangibleFixedAssets": [balances[i].intangibleFixedAssets, roundOff(verticalProcentageCalc(balances[i].intangibleFixedAssets, balances[i].totalAssets), 2)],
                "totalFixedAssets": [balances[i].totalFixedAssets, roundOff(verticalProcentageCalc(balances[i].totalFixedAssets, balances[i].totalAssets), 2)],
                "totalAssets": [balances[i].totalAssets, roundOff(verticalProcentageCalc(balances[i].totalAssets, balances[i].totalAssets), 2)],
                "stLoanLiabilities": [balances[i].stLoanLiabilities, roundOff(verticalProcentageCalc(balances[i].stLoanLiabilities, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "debtsPrepaymentsReceived": [balances[i].debtsPrepaymentsReceived, roundOff(verticalProcentageCalc(balances[i].debtsPrepaymentsReceived, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "stProvisions": [balances[i].stProvisions, roundOff(verticalProcentageCalc(balances[i].stProvisions, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "stTargetedFinancings": [balances[i].stTargetedFinancings, roundOff(verticalProcentageCalc(balances[i].stTargetedFinancings, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "totalCurrentLiabilities": [balances[i].totalCurrentLiabilities, roundOff(verticalProcentageCalc(balances[i].totalCurrentLiabilities, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "ltLoanLiabilities": [balances[i].ltLoanLiabilities, roundOff(verticalProcentageCalc(balances[i].ltLoanLiabilities, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "ltDebtsPrepayments": [balances[i].ltDebtsPrepayments, roundOff(verticalProcentageCalc(balances[i].ltDebtsPrepayments, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "ltProvisions": [balances[i].ltProvisions, roundOff(verticalProcentageCalc(balances[i].ltProvisions, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "ltTargetedFinancings": [balances[i].ltTargetedFinancings, roundOff(verticalProcentageCalc(balances[i].ltTargetedFinancings, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "ltLiabilitiesTotal": [balances[i].ltLiabilitiesTotal, roundOff(verticalProcentageCalc(balances[i].ltLiabilitiesTotal, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "totalLiabilities": [balances[i].totalLiabilities, roundOff(verticalProcentageCalc(balances[i].totalLiabilities, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "shareCapital": [balances[i].shareCapital, roundOff(verticalProcentageCalc(balances[i].shareCapital, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "unregisteredShare": [balances[i].unregisteredShare, roundOff(verticalProcentageCalc(balances[i].unregisteredShare, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "unpaidShareCapital": [balances[i].unpaidShareCapital, roundOff(verticalProcentageCalc(balances[i].unpaidShareCapital, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "sharePremium": [balances[i].sharePremium, roundOff(verticalProcentageCalc(balances[i].sharePremium, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "lessOwnShares": [balances[i].lessOwnShares, roundOff(verticalProcentageCalc(balances[i].lessOwnShares, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "legalReserve": [balances[i].legalReserve, roundOff(verticalProcentageCalc(balances[i].legalReserve, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "otherReserves": [balances[i].otherReserves, roundOff(verticalProcentageCalc(balances[i].otherReserves, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "otherOwnersEquity": [balances[i].otherOwnersEquity, roundOff(verticalProcentageCalc(balances[i].otherOwnersEquity, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "retainedProfitLoss": [balances[i].retainedProfitLoss, roundOff(verticalProcentageCalc(balances[i].retainedProfitLoss, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "financialYearNetProfitLoss": [balances[i].financialYearNetProfitLoss, roundOff(verticalProcentageCalc(balances[i].financialYearNetProfitLoss, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "ownersEquityTotal": [balances[i].ownersEquityTotal, roundOff(verticalProcentageCalc(balances[i].ownersEquityTotal, balances[i].totalLiabilitiesOwnersEquity), 2)],
                "totalLiabilitiesOwnersEquity": [balances[i].totalLiabilitiesOwnersEquity, roundOff(verticalProcentageCalc(balances[i].totalLiabilitiesOwnersEquity, balances[i].totalLiabilitiesOwnersEquity), 2)]
            });
        }
        return array;
    };

    //Profit reports vertical analysis

    exports.verticalAnalysisProfitReps = (profitReports,Profit_report_schema) => {
        let array=[];
        for (let i = 0; i < profitReports.length; i++) {
            let profitReportsDate = profitReports[i].year.getFullYear();
            let profitReportsYear = profitReportsDate.toString();
            if (Profit_report_schema === 1) {
                array.push({
                    "year": profitReports[i].profitReportsYear,
                    "salesRevenue": [profitReports[i].salesRevenue, roundOff(verticalProcentageCalc(profitReports[i].salesRevenue, profitReports[i].salesRevenue), 2)],
                    "creditSalesRevenueTotal": [profitReports[i].creditSalesRevenueTotal, roundOff(verticalProcentageCalc(profitReports[i].creditSalesRevenueTotal, profitReports[i].salesRevenue), 2)],
                    "otherOperatingRevenue": [profitReports[i].otherOperatingRevenue, roundOff(verticalProcentageCalc(profitReports[i].otherOperatingRevenue, profitReports[i].salesRevenue), 2)],
                    "agriGoodsWip": [profitReports[i].agriGoodsWip, roundOff(verticalProcentageCalc(profitReports[i].agriGoodsWip, profitReports[i].salesRevenue), 2)],
                    "bioAssetsProfitLoss": [profitReports[i].bioAssetsProfitLoss, roundOff(verticalProcentageCalc(profitReports[i].bioAssetsProfitLoss, profitReports[i].salesRevenue), 2)],
                    "changesGoodsWip": [profitReports[i].changesGoodsWip, roundOff(verticalProcentageCalc(profitReports[i].changesGoodsWip, profitReports[i].salesRevenue), 2)],
                    "ownPurposeCapitalised": [profitReports[i].ownPurposeCapitalised, roundOff(verticalProcentageCalc(profitReports[i].ownPurposeCapitalised, profitReports[i].salesRevenue), 2)],
                    "goodsRawMaterialsServices": [profitReports[i].goodsRawMaterialsServices, roundOff(verticalProcentageCalc(profitReports[i].goodsRawMaterialsServices, profitReports[i].salesRevenue), 2)],
                    "otherOperatingExpenses": [profitReports[i].otherOperatingExpenses, roundOff(verticalProcentageCalc(profitReports[i].otherOperatingExpenses, profitReports[i].salesRevenue), 2)],
                    "wagesSalaries": [profitReports[i].wagesSalaries, roundOff(verticalProcentageCalc(profitReports[i].wagesSalaries, profitReports[i].salesRevenue), 2)],
                    "fixedAssetsDepreciationImpairment": [profitReports[i].fixedAssetsDepreciationImpairment, roundOff(verticalProcentageCalc(profitReports[i].fixedAssetsDepreciationImpairment, profitReports[i].salesRevenue), 2)],
                    "currentAssetsDiscounts": [profitReports[i].currentAssetsDiscounts, roundOff(verticalProcentageCalc(profitReports[i].currentAssetsDiscounts, profitReports[i].salesRevenue), 2)],
                    "otherOperatingCharges": [profitReports[i].otherOperatingCharges, roundOff(verticalProcentageCalc(profitReports[i].otherOperatingCharges, profitReports[i].salesRevenue), 2)],
                    "earningsMinusLosses": [profitReports[i].earningsMinusLosses, roundOff(verticalProcentageCalc(profitReports[i].earningsMinusLosses, profitReports[i].salesRevenue), 2)],
                    "profitLossSubsidiaries": [profitReports[i].profitLossSubsidiaries, roundOff(verticalProcentageCalc(profitReports[i].profitLossSubsidiaries, profitReports[i].salesRevenue), 2)],
                    "profitLossAssociated": [profitReports[i].profitLossAssociated, roundOff(verticalProcentageCalc(profitReports[i].profitLossAssociated, profitReports[i].salesRevenue), 2)],
                    "profitLossFinancialInvestments": [profitReports[i].profitLossFinancialInvestments, roundOff(verticalProcentageCalc(profitReports[i].profitLossFinancialInvestments, profitReports[i].salesRevenue), 2)],
                    "interestIncome": [profitReports[i].interestIncome, roundOff(verticalProcentageCalc(profitReports[i].interestIncome, profitReports[i].salesRevenue), 2)],
                    "interestExpense": [profitReports[i].interestExpense, roundOff(verticalProcentageCalc(profitReports[i].interestExpense, profitReports[i].salesRevenue), 2)],
                    "otherFinancialIncomeExpenses": [profitReports[i].otherFinancialIncomeExpenses, roundOff(verticalProcentageCalc(profitReports[i].otherFinancialIncomeExpenses, profitReports[i].salesRevenue), 2)],
                    "earningsMinusLossesBeforeIncomeExpenses": [profitReports[i].earningsMinusLossesBeforeIncomeExpenses, roundOff(verticalProcentageCalc(profitReports[i].earningsMinusLossesBeforeIncomeExpenses, profitReports[i].salesRevenue), 2)],
                    "incomeTaxExpense": [profitReports[i].incomeTaxExpense, roundOff(verticalProcentageCalc(profitReports[i].incomeTaxExpense, profitReports[i].salesRevenue), 2)],
                    "financialYearEarningsMinusLosses": [profitReports[i].financialYearEarningsMinusLosses, roundOff(verticalProcentageCalc(profitReports[i].financialYearEarningsMinusLosses, profitReports[i].salesRevenue), 2)],
                })
            } else {
                array.push({
                    "year": profitReportsYear,
                    "salesRevenue": [profitReports[i].salesRevenue, roundOff(verticalProcentageCalc(profitReports[i].salesRevenue, profitReports[i].salesRevenue), 2)],
                    "creditSalesRevenueTotal": [profitReports[i].creditSalesRevenueTotal, roundOff(verticalProcentageCalc(profitReports[i].creditSalesRevenueTotal, profitReports[i].salesRevenue), 2)],
                    "salesCost": [profitReports[i].salesCost, roundOff(verticalProcentageCalc(profitReports[i].salesCost, profitReports[i].salesRevenue), 2)],
                    "grossProfitMinusLoss": [profitReports[i].grossProfitMinusLoss, roundOff(verticalProcentageCalc(profitReports[i].grossProfitMinusLoss, profitReports[i].salesRevenue), 2)],
                    "bioAssetsProfitLoss": [profitReports[i].bioAssetsProfitLoss, roundOff(verticalProcentageCalc(profitReports[i].bioAssetsProfitLoss, profitReports[i].salesRevenue), 2)],
                    "marketingExpenses": [profitReports[i].marketingExpenses, roundOff(verticalProcentageCalc(profitReports[i].marketingExpenses, profitReports[i].salesRevenue), 2)],
                    "administrativeExpenses": [profitReports[i].administrativeExpenses, roundOff(verticalProcentageCalc(profitReports[i].administrativeExpenses, profitReports[i].salesRevenue), 2)],
                    "otherOperatingRevenue": [profitReports[i].otherOperatingRevenue, roundOff(verticalProcentageCalc(profitReports[i].otherOperatingRevenue, profitReports[i].salesRevenue), 2)],
                    "otherOperatingCharges": [profitReports[i].otherOperatingCharges, roundOff(verticalProcentageCalc(profitReports[i].otherOperatingCharges, profitReports[i].salesRevenue), 2)],
                    "earningsMinusLosses": [profitReports[i].earningsMinusLosses, roundOff(verticalProcentageCalc(profitReports[i].earningsMinusLosses, profitReports[i].salesRevenue), 2)],
                    "profitLossSubsidiaries": [profitReports[i].profitLossSubsidiaries, roundOff(verticalProcentageCalc(profitReports[i].profitLossSubsidiaries, profitReports[i].salesRevenue), 2)],
                    "profitLossAssociated": [profitReports[i].profitLossAssociated, roundOff(verticalProcentageCalc(profitReports[i].profitLossAssociated, profitReports[i].salesRevenue), 2)],
                    "profitLossFinancialInvestments": [profitReports[i].profitLossFinancialInvestments, roundOff(verticalProcentageCalc(profitReports[i].profitLossFinancialInvestments, profitReports[i].salesRevenue), 2)],
                    "interestIncome": [profitReports[i].interestIncome, roundOff(verticalProcentageCalc(profitReports[i].interestIncome, profitReports[i].salesRevenue), 2)],
                    "interestExpense": [profitReports[i].interestExpense, roundOff(verticalProcentageCalc(profitReports[i].interestExpense, profitReports[i].salesRevenue), 2)],
                    "otherFinancialIncomeExpenses": [profitReports[i].otherFinancialIncomeExpenses, roundOff(verticalProcentageCalc(profitReports[i].otherFinancialIncomeExpenses, profitReports[i].salesRevenue), 2)],
                    "earningsMinusLossesBeforeIncomeExpenses": [profitReports[i].earningsMinusLossesBeforeIncomeExpenses, roundOff(verticalProcentageCalc(profitReports[i].earningsMinusLossesBeforeIncomeExpenses, profitReports[i].salesRevenue), 2)],
                    "incomeTaxExpense": [profitReports[i].incomeTaxExpense, roundOff(verticalProcentageCalc(profitReports[i].incomeTaxExpense, profitReports[i].salesRevenue), 2)],
                    "financialYearEarningsMinusLosses": [profitReports[i].financialYearEarningsMinusLosses, roundOff(verticalProcentageCalc(profitReports[i].financialYearEarningsMinusLosses, profitReports[i].salesRevenue), 2)]
                })
            }
        }
        return array;
    }