$(document).ready(function () {


    let reportResultClone = $('#reportsAcordion').clone();
    let userEmail;
    const kustuta = "<th class='delCol text-primary text-center'><i class='fas fa-trash'></i></th>";
    const kustutaRida = "<td class='delRow text-primary text-center'><i class='fas fa-trash'></i></td>";



    //remove SALVESTA button, disable addRow/addCol button, disable input fields

    function changeSave(x) {
        console.log('kutsuti välja')
        let modal = x.closest('.modal');
        modal.find('table tbody input, .modal-body button').prop("disabled", true);
        modal.find('.delRow , .delCol').addClass('d-none')
        $(x).html('MUUDA');
        $(x).removeClass('salvesta').addClass('changeData')
    }

    function changeDateFormat(x) {
        let split = x.split("T")
        let datePart = split[0];
        let dateArr = datePart.split("-")
        return dateArr[2] + "." + dateArr[1] + "." + dateArr[0];
    }


    //laiskuse script


    const neededKeys1 = ["salesRevenue", "creditSalesRevenueTotal", "otherOperatingRevenue", "agriGoodsWip", "bioAssetsProfitLoss", "changesGoodsWip", "ownPurposeCapitalised", "goodsRawMaterialsServices", "otherOperatingExpenses", "wagesSalaries", "fixedAssetsDepreciationImpairment", "currentAssetsDiscounts", "otherOperatingCharges", "earningsMinusLosses", "profitLossSubsidiaries", "profitLossAssociated", "profitLossFinancialInvestments", "interestIncome", "interestExpense", "otherFinancialIncomeExpenses", "earningsMinusLossesBeforeIncomeExpenses", "incomeTaxExpense", "financialYearEarningsMinusLosses"];
    const neededKeys2 = ["salesRevenue", "creditSalesRevenueTotal", "salesCost", "grossProfitMinusLoss", "bioAssetsProfitLoss", "marketingExpenses", "administrativeExpenses", "otherOperatingRevenue", "otherOperatingCharges", "earningsMinusLosses", "profitLossSubsidiaries", "profitLossAssociated", "profitLossFinancialInvestments", "interestIncome", "interestExpense", "otherFinancialIncomeExpenses", "earningsMinusLossesBeforeIncomeExpenses", "incomeTaxExpense", "financialYearEarningsMinusLosses"];
    const neededKeysBal = ["year", "cash", "stInvestments", "receivablesPrepayments", "inventories", "stBiologicalAssets", "totalCurrentAssets", "investmentsSubUnder", "ltInvestments", "ltReceivablesPrepayments", "realEstateInv", "tangibleAssets", "ltBiologicalAssets", "intangibleFixedAssets", "totalFixedAssets", "totalAssets", "stLoanLiabilities", "debtsPrepaymentsReceived", "stProvisions", "stTargetedFinancings", "totalCurrentLiabilities", "ltLoanLiabilities", "ltDebtsPrepayments", "ltProvisions", "ltTargetedFinancings", "ltLiabilitiesTotal", "totalLiabilities", "shareCapital", "unregisteredShare", "unpaidShareCapital", "sharePremium", "lessOwnShares", "legalReserve", "otherReserves", "otherOwnersEquity", "retainedProfitLoss", "financialYearNetProfitLoss", "ownersEquityTotal", "totalLiabilitiesOwnersEquity"];
    let arr;
    let balanceData = $('#balances tbody tr');
    let profitRepsDataS1 = $('#profitReport #schema1 tbody tr')
    let profitRepsDataS2 = $('#profitReport #schema2 tbody tr')


    for (let i = 0; i < balanceData.length; i++) {
        let dataTd = balanceData.eq(i).find('td:eq(0) input').attr('name')
        let text = balanceData.eq(i).find('th').text()
        if (neededKeysBal.indexOf("" + dataTd) != -1) {
            arr +='<tr id="'+dataTd+'Va">\n<th>'+ text +'</th>\n</tr>\n'
        }
    }
    console.log(arr)


    $.ajax({
        url: "/users",
        type: 'GET',
        dataType: "json",
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            userEmail = data.email;
            console.log(userEmail)
            $('#userEmail').text(userEmail);
        },
        error: function (data) {
            console.log(data);
        }
    });

    $.ajax({
        url: "/companies",
        type: 'GET',
        dataType: "json",
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            console.log(data)
            let companiesData = data.companies
            let reportsTableBody = $('.reportsTable').find('tbody')
            $.each(companiesData, function (i, company) {
                let date = changeDateFormat(company.analyse_date)
                $('.reportResult').attr('data-router-view', company._id)
                let tr = `<tr class="nav__item" data-router-link="${company._id}">
                    <td>${company.compName}</td>
                    <td>${company.regNum}</td>
                    <td>${date}</td>
                </tr>`;
                reportsTableBody.append(tr)
            })

        },
        error: function (data) {
            console.log(data);
        }
    });

    $('.reportsTable tbody, .reportResult').on('click', '[data-router-link]', function () {

        let page = $(this).data('router-link');
        let url = window.location.origin + window.location.pathname + '?raport=' + page;
        window.history.pushState({}, '', url);

        router();
    });

    function router() {
        let urlParams = new URLSearchParams(window.location.search);
        let page = urlParams.get('raport') || '';

        if (page.length > 0) {
            let reqBody = { "company_id": page };
            $.ajax({
                url: "/analysisResults",
                type: 'POST',
                dataType: "json",
                data: reqBody,
                xhrFields: {
                    withCredentials: true
                },
                success: function (data) {
                    console.log(data)
                    let results = data.results;
                    let profRepSche = data.compReportSchema;
                    $('#reportHead').text(results.compName)

                    if (profRepSche == 1) {
                        $('#schema2Ha,#schema2Va').remove()
                    } else {
                        $('#schema1Ha,#schema1Va').remove()
                    }

                    //Lühiajalise maksevõime suhtarvud

                    $.each(results.NetWorkingCapitals, function (i, netWorkingCapital) {
                        let th = `<th scope="col" class="text-end">${netWorkingCapital.year}</th>`
                        let td = `<td class="text-end">${netWorkingCapital.netWorkingCapital} €</td>`
                        $('#stSolvencyRatios thead tr').append(th)
                        $('#netWorkingCapital').append(td)
                    })
                    $.each(results.CurrentRatio, function (i, currentRatio) {
                        let td = `<td class="text-end">${currentRatio.currentRatio} korda</td>`
                        $('#currentRatio').append(td)
                    })
                    $.each(results.QuickRatio, function (i, quickRatio) {
                        let td = `<td class="text-end">${quickRatio.quickRatio} korda</td>`
                        $('#quickRatio').append(td)
                    })
                    $.each(results.CashRatio, function (i, cashRatio) {
                        let td = `<td class="text-end">${cashRatio.cashRatio} korda</td>`
                        $('#cashRatio').append(td)
                    })

                    //Efektiivsuse suhtarvud

                    $.each(results.TotalAssetTurnover, function (i, totalAssetTurnover) {
                        let th = `<th scope="col" class="text-end">${totalAssetTurnover.year}</th>`
                        let td = `<td class="text-end">${totalAssetTurnover.totalAssetTurnover} korda</td>`
                        $('#efficiencyRatios thead tr').append(th)
                        $('#totalAssetTurnover').append(td)
                    })
                    $.each(results.DaysAssetsHold, function (i, DaysAssetsHold) {
                        let td = `<td class="text-end">${DaysAssetsHold.DaysAssetsHold} päeva</td>`
                        $('#daysAssetsHold').append(td)
                    })
                    $.each(results.FixedAssetTurnover, function (i, fixedAssetTurnover) {
                        let td = `<td class="text-end">${fixedAssetTurnover.fixedAssetTurnover} korda</td>`
                        $('#fixedAssetTurnover').append(td)
                    })
                    $.each(results.DaysFixedAssetsHold, function (i, DaysFixedAssetsHold) {
                        let td = `<td class="text-end">${DaysFixedAssetsHold.DaysFixedAssetsHold} päeva</td>`
                        $('#daysFixedAssetsHold').append(td)
                    })
                    $.each(results.AccountsReceivablesTurnover, function (i, accountsReceivablesTurnover) {
                        let td = `<td class="text-end">${accountsReceivablesTurnover.accountsReceivablesTurnover} korda</td>`
                        $('#accountsReceivablesTurnover').append(td)
                    })
                    $.each(results.DaysSalesOutstanding, function (i, daysSalesOutstanding) {
                        let td = `<td class="text-end">${daysSalesOutstanding.daysSalesOutstanding} päeva</td>`
                        $('#daysSalesOutstanding').append(td)
                    })
                    $.each(results.InventoryTurnover, function (i, inventoryTurnover) {
                        let td = `<td class="text-end">${inventoryTurnover.inventoryTurnover} korda</td>`
                        $('#inventoryTurnover').append(td)
                    })
                    $.each(results.DaysInventoryHeld, function (i, daysInventoryHeld) {
                        let td = `<td class="text-end">${daysInventoryHeld.daysInventoryHeld} päeva</td>`
                        $('#daysInventoryHeld').append(td)
                    })
                    $.each(results.AccountsPayableTurnover, function (i, accountsPayableTurnover) {
                        let td = `<td class="text-end">${accountsPayableTurnover.accountsPayableTurnover}päeva</td>`
                        $('#accountsPayableTurnover').append(td)
                    })
                    $.each(results.DaysAccountsPayableOutstanding, function (i, daysAccountsPayableOutstanding) {
                        let td = `<td class="text-end">${daysAccountsPayableOutstanding.daysAccountsPayableOutstanding} päeva</td>`
                        $('#daysAccountsPayableOutstanding').append(td)
                    })

                    //Tasuvuse suhtarvud

                    $.each(results.ReturnOnTotalAssets, function (i, returnOnTotalAssets) {
                        let td = `<td class="text-end">${returnOnTotalAssets.returnOnTotalAssets}%</td>`
                        $('#returnOnTotalAssets').append(td)
                    })
                    $.each(results.ReturnOnInvestment, function (i, returnOnInvestment) {
                        let td = `<td class="text-end">${returnOnInvestment.returnOnInvestment}%</td>`
                        $('#returnOnInvestment').append(td)
                    })
                    $.each(results.RoeOnEquity, function (i, roeOnEquity) {
                        let th = `<th scope="col" class="text-end">${roeOnEquity.year}</th>`
                        let td = `<td class="text-end">${roeOnEquity.roeOnEquity}%</td>`
                        $('#roeOnEquity').append(td)
                        $('#profitabilityRatios thead tr').append(th)
                    })
                    $.each(results.RoeOnSales, function (i, roeOnSales) {
                        let td = `<td class="text-end">${roeOnSales.roeOnSales}%</td>`
                        $('#roeOnSales').append(td)
                    })
                    $.each(results.GrossProfitMargin, function (i, grossProfitMargin) {
                        let td = `<td class="text-end">${grossProfitMargin.grossProfitMargin}%</td>`
                        $('#grossProfitMargin').append(td)
                    })
                    $.each(results.OperatingProfitMargin, function (i, operatingProfitMargin) {
                        let td = `<td class="text-end">${operatingProfitMargin.operatingProfitMargin}%</td>`
                        $('#operatingProfitMargin').append(td)
                    })

                    //Pikaajal maksevõime suhtarvud

                    $.each(results.TotalDeptRatio, function (i, totalDeptRatio) {
                        let th = `<th scope="col" class="text-end">${totalDeptRatio.year}</th>`
                        let td = `<td class="text-end">${totalDeptRatio.totalDeptRatio}%</td>`
                        $('#totalDeptRatio').append(td)
                        $('#ltSolvencyRatios thead tr').append(th)
                    })
                    $.each(results.SolidityEquityRatio, function (i, solidityEquityRatio) {
                        let td = `<td class="text-end">${solidityEquityRatio.solidityEquityRatio}%</td>`
                        $('#solidityEquityRatio').append(td)
                    })
                    $.each(results.LtDebtRatio, function (i, ltDebtRatio) {
                        let td = `<td class="text-end">${ltDebtRatio.ltDebtRatio}%</td>`
                        $('#ltDebtRatio').append(td)
                    })

                    //bilansi Horisontaalanalüüs

                    $.each(results.HorizontalAnalysisBalances, function (i, data) {
                        let th = `<th scope="col" class="text-end">${data.year}</th><th class="text-end" scope="col">Absoluut</th><th class="text-end" scope="col">Protsent</th>`
                        $('#balanceHorizontal thead tr').append(th)


                        $.each(data.cash, function (i, cash) {
                            let td = `<td class="text-end">${cash}</td>`
                            $("#cashHa").append(td)
                        })
                        $.each(data.stInvestments, function (i, stInvestments) {
                            let td = `<td class="text-end">${stInvestments}</td>`
                            $("#stInvestmentsHa").append(td)
                        })
                        $.each(data.receivablesPrepayments, function (i, receivablesPrepayments) {
                            let td = `<td class="text-end">${receivablesPrepayments}</td>`
                            $("#receivablesPrepaymentsHa").append(td)
                        })
                        $.each(data.inventories, function (i, inventories) {
                            let td = `<td class="text-end">${inventories}</td>`
                            $("#inventoriesHa").append(td)
                        })
                        $.each(data.stBiologicalAssets, function (i, stBiologicalAssets) {
                            let td = `<td class="text-end">${stBiologicalAssets}</td>`
                            $("#stBiologicalAssetsHa").append(td)
                        })
                        $.each(data.totalCurrentAssets, function (i, totalCurrentAssets) {
                            let td = `<td class="text-end">${totalCurrentAssets}</td>`
                            $("#totalCurrentAssetsHa").append(td)
                        })
                        $.each(data.investmentsSubUnder, function (i, investmentsSubUnder) {
                            let td = `<td class="text-end">${investmentsSubUnder}</td>`
                            $("#investmentsSubUnderHa").append(td)
                        })
                        $.each(data.ltInvestments, function (i, ltInvestments) {
                            let td = `<td class="text-end">${ltInvestments}</td>`
                            $("#ltInvestmentsHa").append(td)
                        })
                        $.each(data.ltReceivablesPrepayments, function (i, ltReceivablesPrepayments) {
                            let td = `<td class="text-end">${ltReceivablesPrepayments}</td>`
                            $("#ltReceivablesPrepaymentsHa").append(td)
                        })
                        $.each(data.realEstateInv, function (i, realEstateInv) {
                            let td = `<td class="text-end">${realEstateInv}</td>`
                            $("#realEstateInvHa").append(td)
                        })
                        $.each(data.tangibleAssets, function (i, tangibleAssets) {
                            let td = `<td class="text-end">${tangibleAssets}</td>`
                            $("#tangibleAssetsHa").append(td)
                        })
                        $.each(data.ltBiologicalAssets, function (i, ltBiologicalAssets) {
                            let td = `<td class="text-end">${ltBiologicalAssets}</td>`
                            $("#ltBiologicalAssetsHa").append(td)
                        })
                        $.each(data.intangibleFixedAssets, function (i, intangibleFixedAssets) {
                            let td = `<td class="text-end">${intangibleFixedAssets}</td>`
                            $("#intangibleFixedAssetsHa").append(td)
                        })
                        $.each(data.totalFixedAssets, function (i, totalFixedAssets) {
                            let td = `<td class="text-end">${totalFixedAssets}</td>`
                            $("#totalFixedAssetsHa").append(td)
                        })
                        $.each(data.totalAssets, function (i, totalAssets) {
                            let td = `<td class="text-end">${totalAssets}</td>`
                            $("#totalAssetsHa").append(td)
                        })
                        $.each(data.stLoanLiabilities, function (i, stLoanLiabilities) {
                            let td = `<td class="text-end">${stLoanLiabilities}</td>`
                            $("#stLoanLiabilitiesHa").append(td)
                        })
                        $.each(data.debtsPrepaymentsReceived, function (i, debtsPrepaymentsReceived) {
                            let td = `<td class="text-end">${debtsPrepaymentsReceived}</td>`
                            $("#debtsPrepaymentsReceivedHa").append(td)
                        })
                        $.each(data.stProvisions, function (i, stProvisions) {
                            let td = `<td class="text-end">${stProvisions}</td>`
                            $("#stProvisionsHa").append(td)
                        })
                        $.each(data.stTargetedFinancings, function (i, stTargetedFinancings) {
                            let td = `<td class="text-end">${stTargetedFinancings}</td>`
                            $("#stTargetedFinancingsHa").append(td)
                        })
                        $.each(data.totalCurrentLiabilities, function (i, totalCurrentLiabilities) {
                            let td = `<td class="text-end">${totalCurrentLiabilities}</td>`
                            $("#totalCurrentLiabilitiesHa").append(td)
                        })
                        $.each(data.ltLoanLiabilities, function (i, ltLoanLiabilities) {
                            let td = `<td class="text-end">${ltLoanLiabilities}</td>`
                            $("#ltLoanLiabilitiesHa").append(td)
                        })
                        $.each(data.ltDebtsPrepayments, function (i, ltDebtsPrepayments) {
                            let td = `<td class="text-end">${ltDebtsPrepayments}</td>`
                            $("#ltDebtsPrepaymentsHa").append(td)
                        })
                        $.each(data.ltProvisions, function (i, ltProvisions) {
                            let td = `<td class="text-end">${ltProvisions}</td>`
                            $("#ltProvisionsHa").append(td)
                        })
                        $.each(data.ltTargetedFinancings, function (i, ltTargetedFinancings) {
                            let td = `<td class="text-end">${ltTargetedFinancings}</td>`
                            $("#ltTargetedFinancingsHa").append(td)
                        })
                        $.each(data.ltLiabilitiesTotal, function (i, ltLiabilitiesTotal) {
                            let td = `<td class="text-end">${ltLiabilitiesTotal}</td>`
                            $("#ltLiabilitiesTotalHa").append(td)
                        })
                        $.each(data.totalLiabilities, function (i, totalLiabilities) {
                            let td = `<td class="text-end">${totalLiabilities}</td>`
                            $("#totalLiabilitiesHa").append(td)
                        })
                        $.each(data.shareCapital, function (i, shareCapital) {
                            let td = `<td class="text-end">${shareCapital}</td>`
                            $("#shareCapitalHa").append(td)
                        })
                        $.each(data.unregisteredShare, function (i, unregisteredShare) {
                            let td = `<td class="text-end">${unregisteredShare}</td>`
                            $("#unregisteredShareHa").append(td)
                        })
                        $.each(data.unpaidShareCapital, function (i, unpaidShareCapital) {
                            let td = `<td class="text-end">${unpaidShareCapital}</td>`
                            $("#unpaidShareCapitalHa").append(td)
                        })
                        $.each(data.sharePremium, function (i, sharePremium) {
                            let td = `<td class="text-end">${sharePremium}</td>`
                            $("#sharePremiumHa").append(td)
                        })
                        $.each(data.lessOwnShares, function (i, lessOwnShares) {
                            let td = `<td class="text-end">${lessOwnShares}</td>`
                            $("#lessOwnSharesHa").append(td)
                        })
                        $.each(data.legalReserve, function (i, legalReserve) {
                            let td = `<td class="text-end">${legalReserve}</td>`
                            $("#legalReserveHa").append(td)
                        })
                        $.each(data.otherReserves, function (i, otherReserves) {
                            let td = `<td class="text-end">${otherReserves}</td>`
                            $("#otherReservesHa").append(td)
                        })
                        $.each(data.otherOwnersEquity, function (i, otherOwnersEquity) {
                            let td = `<td class="text-end">${otherOwnersEquity}</td>`
                            $("#otherOwnersEquityHa").append(td)
                        })
                        $.each(data.retainedProfitLoss, function (i, retainedProfitLoss) {
                            let td = `<td class="text-end">${retainedProfitLoss}</td>`
                            $("#retainedProfitLossHa").append(td)
                        })
                        $.each(data.financialYearNetProfitLoss, function (i, financialYearNetProfitLoss) {
                            let td = `<td class="text-end">${financialYearNetProfitLoss}</td>`
                            $("#financialYearNetProfitLossHa").append(td)
                        })
                        $.each(data.ownersEquityTotal, function (i, ownersEquityTotal) {
                            let td = `<td class="text-end">${ownersEquityTotal}</td>`
                            $("#ownersEquityTotalHa").append(td)
                        })
                        $.each(data.totalLiabilitiesOwnersEquity, function (i, totalLiabilitiesOwnersEquity) {
                            let td = `<td class="text-end">${totalLiabilitiesOwnersEquity}</td>`
                            $("#totalLiabilitiesOwnersEquityHa").append(td)
                        })


                    })

                    //Kasumiaruande horisontaalanalüüs

                    $.each(results.HorizontalAnalysisProfitReps, function (i, data) {
                        console.log('click')
                        let th = `<th scope="col" class="text-end">${data.year}</th><th class="text-end" scope="col">Absoluut</th><th class="text-end" scope="col">Protsent</th>`
                        $('#profReportsHorizontal thead tr').append(th)

                        if (profRepSche == 1) {
                            $.each(data.salesRevenue, function (i, salesRevenue) {
                                let td = `<td class="text-end">${salesRevenue}</td>`
                                $("#salesRevenueHa").append(td)
                            })
                            $.each(data.creditSalesRevenueTotal, function (i, creditSalesRevenueTotal) {
                                let td = `<td class="text-end">${creditSalesRevenueTotal}</td>`
                                $("#creditSalesRevenueTotalHa").append(td)
                            })
                            $.each(data.otherOperatingRevenue, function (i, otherOperatingRevenue) {
                                let td = `<td class="text-end">${otherOperatingRevenue}</td>`
                                $("#otherOperatingRevenueHa").append(td)
                            })
                            $.each(data.agriGoodsWip, function (i, agriGoodsWip) {
                                let td = `<td class="text-end">${agriGoodsWip}</td>`
                                $("#agriGoodsWipHa").append(td)
                            })
                            $.each(data.bioAssetsProfitLoss, function (i, bioAssetsProfitLoss) {
                                let td = `<td class="text-end">${bioAssetsProfitLoss}</td>`
                                $("#bioAssetsProfitLossHa").append(td)
                            })
                            $.each(data.changesGoodsWip, function (i, changesGoodsWip) {
                                let td = `<td class="text-end">${changesGoodsWip}</td>`
                                $("#changesGoodsWipHa").append(td)
                            })
                            $.each(data.ownPurposeCapitalised, function (i, ownPurposeCapitalised) {
                                let td = `<td class="text-end">${ownPurposeCapitalised}</td>`
                                $("#ownPurposeCapitalisedHa").append(td)
                            })
                            $.each(data.goodsRawMaterialsServices, function (i, goodsRawMaterialsServices) {
                                let td = `<td class="text-end">${goodsRawMaterialsServices}</td>`
                                $("#goodsRawMaterialsServicesHa").append(td)
                            })
                            $.each(data.otherOperatingExpenses, function (i, otherOperatingExpenses) {
                                let td = `<td class="text-end">${otherOperatingExpenses}</td>`
                                $("#otherOperatingExpensesHa").append(td)
                            })
                            $.each(data.wagesSalaries, function (i, wagesSalaries) {
                                let td = `<td class="text-end">${wagesSalaries}</td>`
                                $("#wagesSalariesHa").append(td)
                            })
                            $.each(data.fixedAssetsDepreciationImpairment, function (i, fixedAssetsDepreciationImpairment) {
                                let td = `<td class="text-end">${fixedAssetsDepreciationImpairment}</td>`
                                $("#fixedAssetsDepreciationImpairmentHa").append(td)
                            })
                            $.each(data.currentAssetsDiscounts, function (i, currentAssetsDiscounts) {
                                let td = `<td class="text-end">${currentAssetsDiscounts}</td>`
                                $("#currentAssetsDiscountsHa").append(td)
                            })
                            $.each(data.otherOperatingCharges, function (i, otherOperatingCharges) {
                                let td = `<td class="text-end">${otherOperatingCharges}</td>`
                                $("#otherOperatingChargesHa").append(td)
                            })
                            $.each(data.earningsMinusLosses, function (i, earningsMinusLosses) {
                                let td = `<td class="text-end">${earningsMinusLosses}</td>`
                                $("#earningsMinusLossesHa").append(td)
                            })
                            $.each(data.profitLossSubsidiaries, function (i, profitLossSubsidiaries) {
                                let td = `<td class="text-end">${profitLossSubsidiaries}</td>`
                                $("#profitLossSubsidiariesHa").append(td)
                            })
                            $.each(data.profitLossAssociated, function (i, profitLossAssociated) {
                                let td = `<td class="text-end">${profitLossAssociated}</td>`
                                $("#profitLossAssociatedHa").append(td)
                            })
                            $.each(data.profitLossFinancialInvestments, function (i, profitLossFinancialInvestments) {
                                let td = `<td class="text-end">${profitLossFinancialInvestments}</td>`
                                $("#profitLossFinancialInvestmentsHa").append(td)
                            })
                            $.each(data.interestIncome, function (i, interestIncome) {
                                let td = `<td class="text-end">${interestIncome}</td>`
                                $("#interestIncomeHa").append(td)
                            })
                            $.each(data.interestExpense, function (i, interestExpense) {
                                let td = `<td class="text-end">${interestExpense}</td>`
                                $("#interestExpenseHa").append(td)
                            })
                            $.each(data.otherFinancialIncomeExpenses, function (i, otherFinancialIncomeExpenses) {
                                let td = `<td class="text-end">${otherFinancialIncomeExpenses}</td>`
                                $("#otherFinancialIncomeExpensesHa").append(td)
                            })
                            $.each(data.earningsMinusLossesBeforeIncomeExpenses, function (i, earningsMinusLossesBeforeIncomeExpenses) {
                                let td = `<td class="text-end">${earningsMinusLossesBeforeIncomeExpenses}</td>`
                                $("#earningsMinusLossesBeforeIncomeExpensesHa").append(td)
                            })
                            $.each(data.incomeTaxExpense, function (i, incomeTaxExpense) {
                                let td = `<td class="text-end">${incomeTaxExpense}</td>`
                                $("#incomeTaxExpenseHa").append(td)
                            })
                            $.each(data.financialYearEarningsMinusLosses, function (i, financialYearEarningsMinusLosses) {
                                let td = `<td class="text-end">${financialYearEarningsMinusLosses}</td>`
                                $("#financialYearEarningsMinusLossesHa").append(td)
                            })
                        } else {
                            $.each(data.salesRevenue, function (i, salesRevenue) {
                                let td = `<td class="text-end">${salesRevenue}</td>`
                                $("#salesRevenueHa").append(td)
                            })
                            $.each(data.creditSalesRevenueTotal, function (i, creditSalesRevenueTotal) {
                                let td = `<td class="text-end">${creditSalesRevenueTotal}</td>`
                                $("#creditSalesRevenueTotalHa").append(td)
                            })
                            $.each(data.salesCost, function (i, salesCost) {
                                let td = `<td class="text-end">${salesCost}</td>`
                                $("#salesCostHa").append(td)
                            })
                            $.each(data.grossProfitMinusLoss, function (i, grossProfitMinusLoss) {
                                let td = `<td class="text-end">${grossProfitMinusLoss}</td>`
                                $("#grossProfitMinusLossHa").append(td)
                            })
                            $.each(data.bioAssetsProfitLoss, function (i, bioAssetsProfitLoss) {
                                let td = `<td class="text-end">${bioAssetsProfitLoss}</td>`
                                $("#bioAssetsProfitLossHa").append(td)
                            })
                            $.each(data.marketingExpenses, function (i, marketingExpenses) {
                                let td = `<td class="text-end">${marketingExpenses}</td>`
                                $("#marketingExpensesHa").append(td)
                            })
                            $.each(data.administrativeExpenses, function (i, administrativeExpenses) {
                                let td = `<td class="text-end">${administrativeExpenses}</td>`
                                $("#administrativeExpensesHa").append(td)
                            })
                            $.each(data.otherOperatingRevenue, function (i, otherOperatingRevenue) {
                                let td = `<td class="text-end">${otherOperatingRevenue}</td>`
                                $("#otherOperatingRevenueHa").append(td)
                            })
                            $.each(data.otherOperatingCharges, function (i, otherOperatingCharges) {
                                let td = `<td class="text-end">${otherOperatingCharges}</td>`
                                $("#otherOperatingChargesHa").append(td)
                            })
                            $.each(data.earningsMinusLosses, function (i, earningsMinusLosses) {
                                let td = `<td class="text-end">${earningsMinusLosses}</td>`
                                $("#earningsMinusLossesHa").append(td)
                            })
                            $.each(data.profitLossSubsidiaries, function (i, profitLossSubsidiaries) {
                                let td = `<td class="text-end">${profitLossSubsidiaries}</td>`
                                $("#profitLossSubsidiariesHa").append(td)
                            })
                            $.each(data.profitLossAssociated, function (i, profitLossAssociated) {
                                let td = `<td class="text-end">${profitLossAssociated}</td>`
                                $("#profitLossAssociatedHa").append(td)
                            })
                            $.each(data.profitLossFinancialInvestments, function (i, profitLossFinancialInvestments) {
                                let td = `<td class="text-end">${profitLossFinancialInvestments}</td>`
                                $("#profitLossFinancialInvestmentsHa").append(td)
                            })
                            $.each(data.interestIncome, function (i, interestIncome) {
                                let td = `<td class="text-end">${interestIncome}</td>`
                                $("#interestIncomeHa").append(td)
                            })
                            $.each(data.interestExpense, function (i, interestExpense) {
                                let td = `<td class="text-end">${interestExpense}</td>`
                                $("#interestExpenseHa").append(td)
                            })
                            $.each(data.otherFinancialIncomeExpenses, function (i, otherFinancialIncomeExpenses) {
                                let td = `<td class="text-end">${otherFinancialIncomeExpenses}</td>`
                                $("#otherFinancialIncomeExpensesHa").append(td)
                            })
                            $.each(data.earningsMinusLossesBeforeIncomeExpenses, function (i, earningsMinusLossesBeforeIncomeExpenses) {
                                let td = `<td class="text-end">${earningsMinusLossesBeforeIncomeExpenses}</td>`
                                $("#earningsMinusLossesBeforeIncomeExpensesHa").append(td)
                            })
                            $.each(data.incomeTaxExpense, function (i, incomeTaxExpense) {
                                let td = `<td class="text-end">${incomeTaxExpense}</td>`
                                $("#incomeTaxExpenseHa").append(td)
                            })
                            $.each(data.financialYearEarningsMinusLosses, function (i, financialYearEarningsMinusLosses) {
                                let td = `<td class="text-end">${financialYearEarningsMinusLosses}</td>`
                                $("#financialYearEarningsMinusLossesHa").append(td)
                            })
                        }
                    })

                    //Bilansi vertikaalanalüüs

                    $.each(results.VerticalAnalysisBalances, function (i, data) {
                        let th = `<th scope="col" class="text-end">${data.year}</th><th class="text-end" scope="col">% koguvarast</th>`
                        $('#balanceVertical thead tr').append(th)

                        $.each(data.cash, function (i, cash) {
                            let td = `<td class="text-end">${cash}</td>`
                            $("#cashVa").append(td)
                        })
                        $.each(data.stInvestments, function (i, stInvestments) {
                            let td = `<td class="text-end">${stInvestments}</td>`
                            $("#stInvestmentsVa").append(td)
                        })
                        $.each(data.receivablesPrepayments, function (i, receivablesPrepayments) {
                            let td = `<td class="text-end">${receivablesPrepayments}</td>`
                            $("#receivablesPrepaymentsVa").append(td)
                        })
                        $.each(data.inventories, function (i, inventories) {
                            let td = `<td class="text-end">${inventories}</td>`
                            $("#inventoriesVa").append(td)
                        })
                        $.each(data.stBiologicalAssets, function (i, stBiologicalAssets) {
                            let td = `<td class="text-end">${stBiologicalAssets}</td>`
                            $("#stBiologicalAssetsVa").append(td)
                        })
                        $.each(data.totalCurrentAssets, function (i, totalCurrentAssets) {
                            let td = `<td class="text-end">${totalCurrentAssets}</td>`
                            $("#totalCurrentAssetsVa").append(td)
                        })
                        $.each(data.investmentsSubUnder, function (i, investmentsSubUnder) {
                            let td = `<td class="text-end">${investmentsSubUnder}</td>`
                            $("#investmentsSubUnderVa").append(td)
                        })
                        $.each(data.ltInvestments, function (i, ltInvestments) {
                            let td = `<td class="text-end">${ltInvestments}</td>`
                            $("#ltInvestmentsVa").append(td)
                        })
                        $.each(data.ltReceivablesPrepayments, function (i, ltReceivablesPrepayments) {
                            let td = `<td class="text-end">${ltReceivablesPrepayments}</td>`
                            $("#ltReceivablesPrepaymentsVa").append(td)
                        })
                        $.each(data.realEstateInv, function (i, realEstateInv) {
                            let td = `<td class="text-end">${realEstateInv}</td>`
                            $("#realEstateInvVa").append(td)
                        })
                        $.each(data.tangibleAssets, function (i, tangibleAssets) {
                            let td = `<td class="text-end">${tangibleAssets}</td>`
                            $("#tangibleAssetsVa").append(td)
                        })
                        $.each(data.ltBiologicalAssets, function (i, ltBiologicalAssets) {
                            let td = `<td class="text-end">${ltBiologicalAssets}</td>`
                            $("#ltBiologicalAssetsVa").append(td)
                        })
                        $.each(data.intangibleFixedAssets, function (i, intangibleFixedAssets) {
                            let td = `<td class="text-end">${intangibleFixedAssets}</td>`
                            $("#intangibleFixedAssetsVa").append(td)
                        })
                        $.each(data.totalFixedAssets, function (i, totalFixedAssets) {
                            let td = `<td class="text-end">${totalFixedAssets}</td>`
                            $("#totalFixedAssetsVa").append(td)
                        })
                        $.each(data.totalAssets, function (i, totalAssets) {
                            let td = `<td class="text-end">${totalAssets}</td>`
                            $("#totalAssetsVa").append(td)
                        })
                        $.each(data.stLoanLiabilities, function (i, stLoanLiabilities) {
                            let td = `<td class="text-end">${stLoanLiabilities}</td>`
                            $("#stLoanLiabilitiesVa").append(td)
                        })
                        $.each(data.debtsPrepaymentsReceived, function (i, debtsPrepaymentsReceived) {
                            let td = `<td class="text-end">${debtsPrepaymentsReceived}</td>`
                            $("#debtsPrepaymentsReceivedVa").append(td)
                        })
                        $.each(data.stProvisions, function (i, stProvisions) {
                            let td = `<td class="text-end">${stProvisions}</td>`
                            $("#stProvisionsVa").append(td)
                        })
                        $.each(data.stTargetedFinancings, function (i, stTargetedFinancings) {
                            let td = `<td class="text-end">${stTargetedFinancings}</td>`
                            $("#stTargetedFinancingsVa").append(td)
                        })
                        $.each(data.totalCurrentLiabilities, function (i, totalCurrentLiabilities) {
                            let td = `<td class="text-end">${totalCurrentLiabilities}</td>`
                            $("#totalCurrentLiabilitiesVa").append(td)
                        })
                        $.each(data.ltLoanLiabilities, function (i, ltLoanLiabilities) {
                            let td = `<td class="text-end">${ltLoanLiabilities}</td>`
                            $("#ltLoanLiabilitiesVa").append(td)
                        })
                        $.each(data.ltDebtsPrepayments, function (i, ltDebtsPrepayments) {
                            let td = `<td class="text-end">${ltDebtsPrepayments}</td>`
                            $("#ltDebtsPrepaymentsVa").append(td)
                        })
                        $.each(data.ltProvisions, function (i, ltProvisions) {
                            let td = `<td class="text-end">${ltProvisions}</td>`
                            $("#ltProvisionsVa").append(td)
                        })
                        $.each(data.ltTargetedFinancings, function (i, ltTargetedFinancings) {
                            let td = `<td class="text-end">${ltTargetedFinancings}</td>`
                            $("#ltTargetedFinancingsVa").append(td)
                        })
                        $.each(data.ltLiabilitiesTotal, function (i, ltLiabilitiesTotal) {
                            let td = `<td class="text-end">${ltLiabilitiesTotal}</td>`
                            $("#ltLiabilitiesTotalVa").append(td)
                        })
                        $.each(data.totalLiabilities, function (i, totalLiabilities) {
                            let td = `<td class="text-end">${totalLiabilities}</td>`
                            $("#totalLiabilitiesVa").append(td)
                        })
                        $.each(data.shareCapital, function (i, shareCapital) {
                            let td = `<td class="text-end">${shareCapital}</td>`
                            $("#shareCapitalVa").append(td)
                        })
                        $.each(data.unregisteredShare, function (i, unregisteredShare) {
                            let td = `<td class="text-end">${unregisteredShare}</td>`
                            $("#unregisteredShareVa").append(td)
                        })
                        $.each(data.unpaidShareCapital, function (i, unpaidShareCapital) {
                            let td = `<td class="text-end">${unpaidShareCapital}</td>`
                            $("#unpaidShareCapitalVa").append(td)
                        })
                        $.each(data.sharePremium, function (i, sharePremium) {
                            let td = `<td class="text-end">${sharePremium}</td>`
                            $("#sharePremiumVa").append(td)
                        })
                        $.each(data.lessOwnShares, function (i, lessOwnShares) {
                            let td = `<td class="text-end">${lessOwnShares}</td>`
                            $("#lessOwnSharesVa").append(td)
                        })
                        $.each(data.legalReserve, function (i, legalReserve) {
                            let td = `<td class="text-end">${legalReserve}</td>`
                            $("#legalReserveVa").append(td)
                        })
                        $.each(data.otherReserves, function (i, otherReserves) {
                            let td = `<td class="text-end">${otherReserves}</td>`
                            $("#otherReservesVa").append(td)
                        })
                        $.each(data.otherOwnersEquity, function (i, otherOwnersEquity) {
                            let td = `<td class="text-end">${otherOwnersEquity}</td>`
                            $("#otherOwnersEquityVa").append(td)
                        })
                        $.each(data.retainedProfitLoss, function (i, retainedProfitLoss) {
                            let td = `<td class="text-end">${retainedProfitLoss}</td>`
                            $("#retainedProfitLossVa").append(td)
                        })
                        $.each(data.financialYearNetProfitLoss, function (i, financialYearNetProfitLoss) {
                            let td = `<td class="text-end">${financialYearNetProfitLoss}</td>`
                            $("#financialYearNetProfitLossVa").append(td)
                        })
                        $.each(data.ownersEquityTotal, function (i, ownersEquityTotal) {
                            let td = `<td class="text-end">${ownersEquityTotal}</td>`
                            $("#ownersEquityTotalVa").append(td)
                        })
                        $.each(data.totalLiabilitiesOwnersEquity, function (i, totalLiabilitiesOwnersEquity) {
                            let td = `<td class="text-end">${totalLiabilitiesOwnersEquity}</td>`
                            $("#totalLiabilitiesOwnersEquityVa").append(td)
                        })

                    })

                    //Kasumiaruande vertikaalanalüüs

                    $.each(results.VerticalAnalysisProfitReps, function (i, data) {
                        let th = `<th scope="col" class="text-end">${data.year}</th><th class="text-end" scope="col">% müügitulust</th>`
                        $('#profReportsVertical thead tr').append(th)
                        if (profRepSche == 1) {
                            $.each(data.salesRevenue, function (i, salesRevenue) {
                                let td = `<td class="text-end">${salesRevenue}</td>`
                                $("#salesRevenueVa").append(td)
                            })
                            $.each(data.creditSalesRevenueTotal, function (i, creditSalesRevenueTotal) {
                                let td = `<td class="text-end">${creditSalesRevenueTotal}</td>`
                                $("#creditSalesRevenueTotalVa").append(td)
                            })
                            $.each(data.otherOperatingRevenue, function (i, otherOperatingRevenue) {
                                let td = `<td class="text-end">${otherOperatingRevenue}</td>`
                                $("#otherOperatingRevenueVa").append(td)
                            })
                            $.each(data.agriGoodsWip, function (i, agriGoodsWip) {
                                let td = `<td class="text-end">${agriGoodsWip}</td>`
                                $("#agriGoodsWipVa").append(td)
                            })
                            $.each(data.bioAssetsProfitLoss, function (i, bioAssetsProfitLoss) {
                                let td = `<td class="text-end">${bioAssetsProfitLoss}</td>`
                                $("#bioAssetsProfitLossVa").append(td)
                            })
                            $.each(data.changesGoodsWip, function (i, changesGoodsWip) {
                                let td = `<td class="text-end">${changesGoodsWip}</td>`
                                $("#changesGoodsWipVa").append(td)
                            })
                            $.each(data.ownPurposeCapitalised, function (i, ownPurposeCapitalised) {
                                let td = `<td class="text-end">${ownPurposeCapitalised}</td>`
                                $("#ownPurposeCapitalisedVa").append(td)
                            })
                            $.each(data.goodsRawMaterialsServices, function (i, goodsRawMaterialsServices) {
                                let td = `<td class="text-end">${goodsRawMaterialsServices}</td>`
                                $("#goodsRawMaterialsServicesVa").append(td)
                            })
                            $.each(data.otherOperatingExpenses, function (i, otherOperatingExpenses) {
                                let td = `<td class="text-end">${otherOperatingExpenses}</td>`
                                $("#otherOperatingExpensesVa").append(td)
                            })
                            $.each(data.wagesSalaries, function (i, wagesSalaries) {
                                let td = `<td class="text-end">${wagesSalaries}</td>`
                                $("#wagesSalariesVa").append(td)
                            })
                            $.each(data.fixedAssetsDepreciationImpairment, function (i, fixedAssetsDepreciationImpairment) {
                                let td = `<td class="text-end">${fixedAssetsDepreciationImpairment}</td>`
                                $("#fixedAssetsDepreciationImpairmentVa").append(td)
                            })
                            $.each(data.currentAssetsDiscounts, function (i, currentAssetsDiscounts) {
                                let td = `<td class="text-end">${currentAssetsDiscounts}</td>`
                                $("#currentAssetsDiscountsVa").append(td)
                            })
                            $.each(data.otherOperatingCharges, function (i, otherOperatingCharges) {
                                let td = `<td class="text-end">${otherOperatingCharges}</td>`
                                $("#otherOperatingChargesVa").append(td)
                            })
                            $.each(data.earningsMinusLosses, function (i, earningsMinusLosses) {
                                let td = `<td class="text-end">${earningsMinusLosses}</td>`
                                $("#earningsMinusLossesVa").append(td)
                            })
                            $.each(data.profitLossSubsidiaries, function (i, profitLossSubsidiaries) {
                                let td = `<td class="text-end">${profitLossSubsidiaries}</td>`
                                $("#profitLossSubsidiariesVa").append(td)
                            })
                            $.each(data.profitLossAssociated, function (i, profitLossAssociated) {
                                let td = `<td class="text-end">${profitLossAssociated}</td>`
                                $("#profitLossAssociatedVa").append(td)
                            })
                            $.each(data.profitLossFinancialInvestments, function (i, profitLossFinancialInvestments) {
                                let td = `<td class="text-end">${profitLossFinancialInvestments}</td>`
                                $("#profitLossFinancialInvestmentsVa").append(td)
                            })
                            $.each(data.interestIncome, function (i, interestIncome) {
                                let td = `<td class="text-end">${interestIncome}</td>`
                                $("#interestIncomeVa").append(td)
                            })
                            $.each(data.interestExpense, function (i, interestExpense) {
                                let td = `<td class="text-end">${interestExpense}</td>`
                                $("#interestExpenseVa").append(td)
                            })
                            $.each(data.otherFinancialIncomeExpenses, function (i, otherFinancialIncomeExpenses) {
                                let td = `<td class="text-end">${otherFinancialIncomeExpenses}</td>`
                                $("#otherFinancialIncomeExpensesVa").append(td)
                            })
                            $.each(data.earningsMinusLossesBeforeIncomeExpenses, function (i, earningsMinusLossesBeforeIncomeExpenses) {
                                let td = `<td class="text-end">${earningsMinusLossesBeforeIncomeExpenses}</td>`
                                $("#earningsMinusLossesBeforeIncomeExpensesVa").append(td)
                            })
                            $.each(data.incomeTaxExpense, function (i, incomeTaxExpense) {
                                let td = `<td class="text-end">${incomeTaxExpense}</td>`
                                $("#incomeTaxExpenseVa").append(td)
                            })
                            $.each(data.financialYearEarningsMinusLosses, function (i, financialYearEarningsMinusLosses) {
                                let td = `<td class="text-end">${financialYearEarningsMinusLosses}</td>`
                                $("#financialYearEarningsMinusLossesVa").append(td)
                            })
                        } else {
                            $.each(data.salesRevenue, function (i, salesRevenue) {
                                let td = `<td class="text-end">${salesRevenue}</td>`
                                $("#salesRevenueVa").append(td)
                            })
                            $.each(data.creditSalesRevenueTotal, function (i, creditSalesRevenueTotal) {
                                let td = `<td class="text-end">${creditSalesRevenueTotal}</td>`
                                $("#creditSalesRevenueTotalVa").append(td)
                            })
                            $.each(data.salesCost, function (i, salesCost) {
                                let td = `<td class="text-end">${salesCost}</td>`
                                $("#salesCostVa").append(td)
                            })
                            $.each(data.grossProfitMinusLoss, function (i, grossProfitMinusLoss) {
                                let td = `<td class="text-end">${grossProfitMinusLoss}</td>`
                                $("#grossProfitMinusLossVa").append(td)
                            })
                            $.each(data.bioAssetsProfitLoss, function (i, bioAssetsProfitLoss) {
                                let td = `<td class="text-end">${bioAssetsProfitLoss}</td>`
                                $("#bioAssetsProfitLossVa").append(td)
                            })
                            $.each(data.marketingExpenses, function (i, marketingExpenses) {
                                let td = `<td class="text-end">${marketingExpenses}</td>`
                                $("#marketingExpensesVa").append(td)
                            })
                            $.each(data.administrativeExpenses, function (i, administrativeExpenses) {
                                let td = `<td class="text-end">${administrativeExpenses}</td>`
                                $("#administrativeExpensesVa").append(td)
                            })
                            $.each(data.otherOperatingRevenue, function (i, otherOperatingRevenue) {
                                let td = `<td class="text-end">${otherOperatingRevenue}</td>`
                                $("#otherOperatingRevenueVa").append(td)
                            })
                            $.each(data.otherOperatingCharges, function (i, otherOperatingCharges) {
                                let td = `<td class="text-end">${otherOperatingCharges}</td>`
                                $("#otherOperatingChargesVa").append(td)
                            })
                            $.each(data.earningsMinusLosses, function (i, earningsMinusLosses) {
                                let td = `<td class="text-end">${earningsMinusLosses}</td>`
                                $("#earningsMinusLossesVa").append(td)
                            })
                            $.each(data.profitLossSubsidiaries, function (i, profitLossSubsidiaries) {
                                let td = `<td class="text-end">${profitLossSubsidiaries}</td>`
                                $("#profitLossSubsidiariesVa").append(td)
                            })
                            $.each(data.profitLossAssociated, function (i, profitLossAssociated) {
                                let td = `<td class="text-end">${profitLossAssociated}</td>`
                                $("#profitLossAssociatedVa").append(td)
                            })
                            $.each(data.profitLossFinancialInvestments, function (i, profitLossFinancialInvestments) {
                                let td = `<td class="text-end">${profitLossFinancialInvestments}</td>`
                                $("#profitLossFinancialInvestmentsVa").append(td)
                            })
                            $.each(data.interestIncome, function (i, interestIncome) {
                                let td = `<td class="text-end">${interestIncome}</td>`
                                $("#interestIncomeVa").append(td)
                            })
                            $.each(data.interestExpense, function (i, interestExpense) {
                                let td = `<td class="text-end">${interestExpense}</td>`
                                $("#interestExpenseVa").append(td)
                            })
                            $.each(data.otherFinancialIncomeExpenses, function (i, otherFinancialIncomeExpenses) {
                                let td = `<td class="text-end">${otherFinancialIncomeExpenses}</td>`
                                $("#otherFinancialIncomeExpensesVa").append(td)
                            })
                            $.each(data.earningsMinusLossesBeforeIncomeExpenses, function (i, earningsMinusLossesBeforeIncomeExpenses) {
                                let td = `<td class="text-end">${earningsMinusLossesBeforeIncomeExpenses}</td>`
                                $("#earningsMinusLossesBeforeIncomeExpensesVa").append(td)
                            })
                            $.each(data.incomeTaxExpense, function (i, incomeTaxExpense) {
                                let td = `<td class="text-end">${incomeTaxExpense}</td>`
                                $("#incomeTaxExpenseVa").append(td)
                            })
                            $.each(data.financialYearEarningsMinusLosses, function (i, financialYearEarningsMinusLosses) {
                                let td = `<td class="text-end">${financialYearEarningsMinusLosses}</td>`
                                $("#financialYearEarningsMinusLossesVa").append(td)
                            })
                        }
                    })
                },
                error: function (data) {
                    console.log(data.responseJSON)
                }
            });
        } else {
            $('#reportsAcordion').replaceWith(reportResultClone.clone())
        }

        $('[data-router-view]').addClass('d-none');
        $('[data-router-view="' + page + '"]').removeClass('d-none');

    }
    router();
    $(window).on('popstate', function () {
        router();
    });

    //Send company data to backend

    $('#compData').submit((event) => {
        event.preventDefault();
        const urlString = "/companies";
        const reqType = "POST"
        let vatObl;
        if ($('#vat_obligatory:checked').val() != "yes") {
            vatObl = "no"
        } else {
            vatObl = "yes"
        }
        let compdata = {
            compName: $('#compName').val(),
            regNum: $('#regNum').val(),
            address: $('#adress').val(),
            comp_email: $('#comp_email').val(),
            phone: $('#phone').val(),
            additional_info: $('#additional_info').val(),
            Profit_report_schema: $('input[name="Profit_report_schema"]:checked').val(),
            vat_obligatory: vatObl,
            yearLength: $('input[name="yearLength"]:checked').val()
        }
        console.log(compdata)
        $.ajax({
            url: "/companies",
            type: 'POST',
            dataType: "json",
            data: compdata,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                console.log(data)
                $('#compName').removeClass('is-invalid')
                $("#compData input,#compData textarea,#compData button").prop("disabled", true);
                $('#compData .alert-success').removeClass('d-none').text(data.success)
                $('#kasumiaruanne, #bilanss ,#tasuvuspunkt').prop('disabled', false);
                $('#kasumiaruanne, #bilanss ,#tasuvuspunkt').removeClass('disabled');
                $('#kasumiAruandeModal .modal-title').append(data.Profit_report_schema);
                let compID = data._id;
                $('#kasumiAruandeModal,#balanceModal,#breakEvenModal').attr('data-compid', compID)

                if (data.vat_obligatory === "no") { $('.creditSalesRevenue0,.creditSalesRevenue9,.creditSalesRevenue20').addClass('d-none') }
                if (data.Profit_report_schema == 1) {
                    $('#schema2').remove();
                } else {
                    $('#schema1').remove();
                }
            },
            error: function (data) {
                console.log(data.responseJSON)
                if (data.status == 401) {
                    $('#compDataErr').text(data.responseJSON.error)
                    $('#compName').addClass('is-invalid')
                }
            }
        });

    })

    //Send breakevenpoint graphics data to backend

    $('#breakEvenPoint').submit(function (e) {
        e.preventDefault();
        let thisModal = $(this).closest('.modal');
        thisModal.find('.alert').removeClass('alert-danger , alert-success');
        thisModal.find('.alert').addClass('d-none');
        let rows = $(this).find('tbody tr');
        let companyID = '' + $(this).closest('.modal').attr('data-compid');
        let saveBtn = $(this).closest('.modal').find('.salvesta');

        let breakEvenObj = {
            "company_id": companyID,
            "salesTurnover": [],
            "expenses": []
        };

        for (let i = 0; i < rows.length; i++) {
            let salesT;
            let expens;
            if (rows.eq(i).find('.salesTurnover').val() === '') {
                salesT = 0
                rows.eq(i).find('.salesTurnover').val(0)
            } else {
                salesT = parseFloat(rows.eq(i).find('.salesTurnover').val())
            };
            if (rows.eq(i).find('.expenses').val() === '') {
                expens = 0;
                rows.eq(i).find('.expenses').val(0)
            } else {
                expens = parseFloat(rows.eq(i).find('.expenses').val())
            }
            breakEvenObj.salesTurnover.push(salesT)
            breakEvenObj.expenses.push(expens)
        }

        console.log(JSON.stringify(breakEvenObj))

        $.ajax({
            url: "/breakEvenAnalysis",
            type: 'PUT',
            dataType: 'json',
            accept: 'json',
            data: breakEvenObj,
            traditional: true,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                thisModal.find('.alert').removeClass('d-none').text(data.success)
                thisModal.find('.alert').addClass('alert-success')
                changeSave(saveBtn);
            },
            error: function (data) {
                let vastus = data.responseJSON.error
                thisModal.find('.alert').removeClass('d-none')
                thisModal.find('.alert').addClass('alert-danger').text(vastus)
            }
        });

    })

    //Send profitreports data to backend

    $('#profitReport').submit(function (e) {
        e.preventDefault();
        let saveBtn = $(this).closest('.modal').find('.salvesta');
        let thisModal = $(this).closest('.modal');
        thisModal.find('.alert').removeClass('alert-danger , alert-success');
        thisModal.find('.alert').addClass('d-none');
        let companyID = '' + $(this).closest('.modal').attr('data-compid');
        let tableBodyRow = $(this).find('table tbody tr');
        let tblRowLen = tableBodyRow.first().find('td').length;
        let dataObj = {
            company_id: companyID,
            years: []
        }

        for (let i = 0; i < tblRowLen; i++) {
            let thisProfitReportObj = {};
            for (let e = 0; e < tableBodyRow.length; e++) {
                let thisRowTd = tableBodyRow.eq(e).find('td').eq(i)
                let tdKey = thisRowTd.find('input').attr('name')
                let tdValue;
                if (thisRowTd.find('input').val() == '') {
                    tdValue = 0;
                    thisRowTd.find('input').val(tdValue)
                } else {
                    tdValue = thisRowTd.find('input').val();
                }
                thisProfitReportObj[tdKey] = parseFloat(tdValue);
            }
            dataObj.years.push(thisProfitReportObj)
        }

        $.ajax({
            url: "/profitReports",
            type: 'PUT',
            dataType: 'json',
            accept: 'json',
            data: dataObj,
            traditional: true,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                thisModal.find('.alert').removeClass('d-none').text(data.success)
                thisModal.find('.alert').addClass('alert-success')
                changeSave(saveBtn)
            },
            error: function (data) {
                let vastus = data.responseJSON.error
                thisModal.find('.alert').removeClass('d-none')
                thisModal.find('.alert').addClass('alert-danger').text(vastus)

            }
        });
    })

    //Send balance data to backend

    $('#balances').submit(function (e) {
        e.preventDefault();
        $('#balanceModal .alert').removeClass('alert-danger , alert-success')
        $('#balanceModal .alert').addClass('d-none');
        let saveBtn = $(this).closest('.modal').find('.salvesta');
        let companyID = '' + $(this).closest('.modal').attr('data-compid');
        let tableBodyRow = $(this).find('table tbody tr');
        let tblRowLen = tableBodyRow.first().find('td').length;
        let dataObj = {
            company_id: companyID,
            dates: []
        }

        for (let i = 0; i < tblRowLen; i++) {
            let thisBalanceObj = {};
            for (let e = 0; e < tableBodyRow.length; e++) {
                let thisRowTd = tableBodyRow.eq(e).find('td').eq(i)
                let tdKey = thisRowTd.find('input').attr('name')
                let tdValue;
                if (thisRowTd.find('input').val() == '' && tdKey !== 'date') {
                    tdValue = 0;
                    thisRowTd.find('input').val(tdValue)
                } else {
                    tdValue = thisRowTd.find('input').val();
                }
                thisBalanceObj[tdKey] = parseFloat(tdValue);
            }
            dataObj.dates.push(thisBalanceObj)
        }

        $.ajax({
            url: "/balances",
            type: 'PUT',
            dataType: 'json',
            accept: 'json',
            data: dataObj,
            traditional: true,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                $('#balanceModal .alert').removeClass('d-none').text(data.success)
                $('#balanceModal .alert').addClass('alert-success')
                changeSave(saveBtn)
            },
            error: function (data) {
                let vastus = data.responseJSON.error
                $('#balanceModal .alert').removeClass('d-none')
                $('#balanceModal .alert').addClass('alert-danger').text(vastus)

            }
        });
    })

    //Allow change data

    $('.modal-footer').on('click', '.changeData', function (e) {
        e.preventDefault();
        let modal = $(this).closest('.modal');
        modal.find('.alert').addClass('d-none');
        modal.find('table tbody input, .modal-body button').prop("disabled", false);
        modal.find('.delRow , .delCol').removeClass('d-none')
        $('#breakEvenMess').text('')
        $(this).html('SALVESTA')
        $(this).removeClass('changeData').addClass('salvesta')
    })

    //Add remove columns table handling

    $('.newProfitCol').on('click', function () {
        let table = $(this).parent().find('form table');
        table.find('thead tr').append(kustuta)
        let tbodyRow = table.find('tbody tr')
        for (let i = 0; i < tbodyRow.length; i++) {
            let td = tbodyRow.eq(i).find('td').eq(1).clone();
            let emptyTd = td.find('input').val('')
            tbodyRow.eq(i).append(td)
        }
    })

    $("table thead tr").on("click", ".delCol", function () {
        let index = $(this).index();
        let table = $(this).closest('table')
        let tbodyRow = table.find('tbody tr')
        for (let i = 0; i < tbodyRow.length; i++) {
            tbodyRow.eq(i).find('td').eq(index - 1).remove();
        }
        $(this).remove();
    })

    //Add remove rows table handling

    $('.addRow').on('click', function () {
        let table = $(this).parent().find('form table');
        let tableBody = table.find('tbody');
        let tableBodyRows = tableBody.find('tr')
        let monthNum = tableBodyRows.length + 1
        let rowClone = tableBody.find('tr').eq(0).clone();
        rowClone.find('.salesTurnover').val('');
        rowClone.find('.expenses').val('');
        rowClone.find('th').text('Kuu ' + monthNum + '')
        if (tableBodyRows.length >= 12) {
            rowClone.append(kustutaRida)
        }
        tableBody.append(rowClone)
    })

    $("table tbody").on("click", ".delRow", function () {
        let modalId = '#' + $(this).closest('.modal').attr('id');
        let thisIndex = $(this).parent().index();
        $(modalId).find('table tbody tr').eq(thisIndex).remove();
        let tableBody = $(modalId).find('table tbody')
        let tableBodyRows = tableBody.find('tr')
        let tableLength = tableBodyRows.length;
        let number = 1;
        for (let i = 0; i < tableLength; i++) {
            tableBodyRows.eq(i).find('th').text('Kuu ' + number + '')
            number += 1;
        }
    })
})


const data = {
    datasets: [
      {
        label: 'Dataset 1',
        data: [100,221,223,221,335,114,654,884,666,113],
      },
      {
        label: 'Dataset 2',
        data: [190,281,273,241,355,174,650,889,667,145],
      }
    ]
  };


const config = {
    type: 'line',
    data,
    options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Chart.js Bar Chart'
          }
        }
      }
  };

var myChart = new Chart(
    document.getElementById('myChart'),
    config
  );

