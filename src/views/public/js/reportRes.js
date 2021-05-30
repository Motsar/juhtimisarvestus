//Variables

const kustuta = "<th class='delCol text-primary text-center'><i class='fas fa-trash'></i></th>";
const kustutaRida = "<td class='delRow text-primary text-center'><i class='fas fa-trash'></i></td>";
let reportResultClone;
let breakEvenResTable = $("#breakEvenPointTable").clone();
let BreakEvenChart = null;
let chartData;
let ctx = $('.myChart');
let counter = 0;

//Round calculation results

let roundOff = (num, places) => {
    const x = Math.pow(10, places);
    return Math.round(num * x) / x;
}

//Enable tooltips

var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})

//Empty chart obj data

function removeData(chart) {
    chart.data.labels = []
    chart.data.datasets[0].data = []
    chart.data.datasets[1].data = []
    chart.update();
}

//Add data to chart obj

function addData(chart, labels, data) {
    labels.forEach((label) => {
        chart.data.labels.push(label);
    })
    data[0].forEach((tulu) => {
        chart.data.datasets[0].data.push(tulu);
    })
    data[1].forEach((kulu) => {
        chart.data.datasets[1].data.push(kulu);
    })
    chart.update();
}

//Add column function

function addColumn(x) {
    let table = x;
    table.find('thead tr').append(kustuta)
    let tbodyRow = table.find('tbody tr')
    for (let i = 0; i < tbodyRow.length; i++) {
        let td = tbodyRow.eq(i).find('td').eq(1).clone();
        td.find('input').val('')
        tbodyRow.eq(i).append(td)
    }
}

//Add rows function

function addRows(x) {
    let tableBody = x.find('tbody');
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
}

//Remove SALVESTA button, disable addRow/addCol button, disable input fields

function changeSave(x) {
    let modal = x.closest('.modal');
    modal.find('.modal-body input , .modal-body button').prop("disabled", true);
    modal.find('.delRow , .modal-body .delCol').addClass('d-none')
    modal.find(".modal-footer").prepend('<button type="submit" class="btn btn-primary changeData">Muuda</button>')
    $(x).remove();
}

//Calculate total sum function

function totalSum(x) {
    let total = 0;
    for (let i = 0; i < x.length; i++) {
        total = total + x[i]
    }
    return total;
}

//Change date recieved from server for populating datepicker

function changeDateFormat(x) {
    let split = x.split("T")
    let datePart = split[0];
    let dateArr = datePart.split("-")
    return dateArr[2] + "." + dateArr[1] + "." + dateArr[0];
}

// function to get balance data with AJAX

function getBalanceData(x) {
    let reqBody = { "company_id": x };
    $.ajax({
        url: "/balances",
        type: 'POST',
        dataType: 'json',
        accept: 'json',
        data: reqBody,
        traditional: true,
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {

            let results = data;
            //Add balance data to balance modal
            if ($('#balances tbody tr:eq(0)').find('td').length < results.length) {
                while ($('#balances tbody tr:eq(0)').find('td').length !== results.length) {
                    addColumn($('#balances table'))
                }
            }
            $.each(results, function (i, balance) {
                $.each(balance, function (e, balanceData) {
                    let value;
                    if (e === "date") {
                        let dateString = balanceData.toString();
                        value = dateString.substr(0, 10);
                    } else {
                        value = balanceData;
                    }
                    $('#balances tbody').find(`[name='${e}']`).eq(i).val(value)
                })
            })
            changeSave($('#balanceModal .salvesta'));
        },
        error: function (data) {
            let vastus = data.responseJSON.error
            console.log(vastus)
        }
    });
}

// function to get profit reports data with AJAX

function getProfitReportData(x) {
    let reqBody = { "company_id": x };
    $.ajax({
        url: "/profitReports",
        type: 'POST',
        dataType: 'json',
        accept: 'json',
        data: reqBody,
        traditional: true,
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            let results = data;
            if ($('#profitReport tbody tr:eq(0)').find('td').length < results.length) {
                while ($('#profitReport tbody tr:eq(0)').find('td').length !== results.length) {
                    addColumn($('#kasumiAruandeModal #profitReport table'))
                }
            }
            $.each(results, function (i, profitReport) {
                $.each(profitReport, function (e, profitRdata) {
                    let value;
                    if (e === "year") {
                        let dateString = profitRdata.toString();
                        value = dateString.substr(0, 4);
                    } else {
                        value = profitRdata;
                    }
                    $('.profitReportForm tbody').find(`[name=${e}]`).eq(i).val(value)
                })
            })
            changeSave($('#kasumiAruandeModal .salvesta'))
        },
        error: function (data) {
            let vastus = data.responseJSON.error
            console.log(vastus)
        }
    });
}

// Download PDF

function downloadPDF(){
    var canvas = ctx;
    var canvasImg = canvas.get(0).toDataURL("image/png", 1.0);
    var doc = new jsPDF('portrait');

    doc.setFontSize(20);
    doc.text(60, 15, "Lühiajalised maksevõime suhtarvud");
    doc.autoTable({  
        html: '#stSolvencyRatios', 
        theme: 'grid', 
        styles: {
            minCellWidth: 8,
            minCellHeight: 6,
            fontSize:5
        },
        headStyles:{
            fillColor: [41, 128, 185]
        },
        margin: { 
                top:30,
                bottom : 20 
            }
    })
    var lastPosY = doc.lastAutoTable.finalY;
    doc.text(73, lastPosY+10, "Efektiivsuse suhtarvud");
    doc.autoTable({  
        html: '#efficiencyRatios', 
        theme: 'grid', 
        styles: {
            minCellWidth: 8,
            minCellHeight: 6,
            fontSize:5
        },
        headStyles:{
            fillColor: [41, 128, 185]
        },
        margin: { 
                top:10,
                bottom : 20
            },
        startY : lastPosY+20
    })
    var lastPosY2 = doc.lastAutoTable.finalY;
    doc.text(75, lastPosY2+10, "Tasuvuse suhtarvud");
    doc.autoTable({  
        html: '#profitabilityRatios', 
        theme: 'grid', 
        styles: {
            minCellWidth: 8,
            minCellHeight: 6,
            fontSize:5
        },
        headStyles:{
            fillColor: [41, 128, 185]
        },
        margin: { 
                top:10,
                bottom : 20
            },
            startY : lastPosY2+20
    })
    var lastPosY3 = doc.lastAutoTable.finalY;
    doc.text(60, lastPosY3+10, "Pikaajalised maksevõime suhtarvud");
    doc.autoTable({  
        html: '#ltSolvencyRatios', 
        theme: 'grid', 
        styles: {
            minCellWidth: 8,
            minCellHeight: 6,
            fontSize:5
        },
        headStyles:{
            fillColor: [41, 128, 185]
        },
        margin: { 
                top:40,
                bottom : 10 
            },
        startY : lastPosY3+20
    })
    doc.addPage();
    doc.text(65, 15, "Bilansi horisontaalanalüüs");
    doc.autoTable({  
        html: '#balanceHorizontal', 
        theme: 'grid', 
        styles: {
            minCellWidth: 8,
            minCellHeight: 6,
            fontSize:5
        },
        headStyles:{
            fillColor: [41, 128, 185]
        },
        margin: { 
                top:30,
                bottom : 10 
            }
    })
    doc.addPage();
    doc.text(60, 15, "Kasumiaruande horisontaalanalüüs");
    doc.autoTable({  
        html: '#profReportsHorizontal', 
        theme: 'grid', 
        styles: {
            minCellWidth: 8,
            minCellHeight: 6,
            fontSize:5
        },
        headStyles:{
            fillColor: [41, 128, 185]
        },
        margin: { 
                top:30,
                bottom : 10 
            }
    }) 
    doc.addPage();
    doc.text(65, 15, "Bilansi vertikaalanalüüs");
    doc.autoTable({  
        html: '#balanceVertical', 
        theme: 'grid', 
        styles: {
            minCellWidth: 8,
            minCellHeight: 6,
            fontSize:5
        },
        headStyles:{
            fillColor: [41, 128, 185]
        },
        margin: { 
                top:30,
                bottom : 10 
            }
    })
    doc.addPage();
    doc.text(60, 15, "Kasumiaruande vertikaalanalüüs");
    doc.autoTable({  
        html: '#profReportsVertical', 
        theme: 'grid', 
        styles: {
            minCellWidth: 8,
            minCellHeight: 6,
            fontSize:5
        },
        headStyles:{
            fillColor: [41, 128, 185]
        },
        margin: { 
                top:30,
                bottom : 10 
            }
    }) 
    doc.addPage();
    doc.text(70, 15, "Tasuvuspunkti tabel");
    doc.autoTable({  
        html: '#breakEvenPointTable', 
        theme: 'grid', 
        styles: {
            minCellWidth: 8,
            minCellHeight: 6,
            fontSize:5
        },
        headStyles:{
            fillColor: [41, 128, 185]
        },
        margin: { 
                top:30,
                bottom : 10 
            }

    }) 
    doc.text(70, 75 , "Tasuvuspunkti graafik");
    doc.addImage(canvasImg, 'PNG', 10 , 90, 189, 120);
    doc.save('Finantsanalüüs.pdf');
}


//Break evenpoint data to breakeven modal

function getBreakEvenData(x) {
    let reqBody = { "company_id": x };
    let salesTurnoverArr;
    let expensesArr;

    $.ajax({
        url: "/breakEvenAnalysis",
        type: 'POST',
        dataType: 'json',
        accept: 'json',
        data: reqBody,
        traditional: true,
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            salesTurnoverArr = data.breakEvenData.salesTurnover
            expensesArr = data.breakEvenData.expenses
            if ($('#breakEvenModal #breakEvenPoint table tbody tr').length < expensesArr.length) {
                while ($('#breakEvenModal #breakEvenPoint table tbody tr').length !== expensesArr.length) {
                    addRows($('#breakEvenModal #breakEvenPoint table'));
                }
            }
            $.each(salesTurnoverArr, function (i, turnover) {
                $('#breakEvenModal #breakEvenPoint table tbody tr').eq(i).find(`[name=salesTurnover]`).val(turnover)
            })

            $.each(expensesArr, function (i, expense) {
                $('#breakEvenModal #breakEvenPoint table tbody tr').eq(i).find(`[name=expenses]`).val(expense)
            })

            //Break even point analysis

            let breakEvenPointSalesTurnOver = [];
            let breakEvenPointExpenses = [];
            let breakEvenPointMonths = [];

            chartData = {
                type: 'line',
                data: {
                    labels: breakEvenPointMonths,
                    datasets: [
                        {
                            label: "Tulud",
                            data: breakEvenPointSalesTurnOver,
                            backgroundColor: "blue",
                            borderColor: "lightblue",
                            fill: false,
                            lineTension: 0,
                            radius: 5
                        },
                        {
                            label: "Kulud",
                            data: breakEvenPointExpenses,
                            backgroundColor: "rgba(247, 40, 1, 1)",
                            borderColor: "rgba(255, 0, 0, 0.38)",
                            fill: false,
                            lineTension: 0,
                            radius: 5
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Tasuvuspunkti Graafik'
                        }
                    }
                }
            };

            let e = 1;
            let profitData = [];

            for (let i = 0; i < salesTurnoverArr.length; i++) {
                breakEvenPointSalesTurnOver.push(salesTurnoverArr[i])
                breakEvenPointExpenses.push(expensesArr[i])
                breakEvenPointMonths.push('Kuu ' + e);
                profitData.push(salesTurnoverArr[i] - expensesArr[i])
                $('#breakEvenPointTable thead tr').append(`<th class="text-end">Kuu ${e}</th>`)
                $('#salesTurnover').append(`<td class="text-end">${salesTurnoverArr[i].toFixed(2)}</td>`)
                $('#expenses').append(`<td class="text-end">${expensesArr[i].toFixed(2)}</td>`)
                $('#profit').append(`<td class="text-end">${roundOff(salesTurnoverArr[i] - expensesArr[i],2)}</td>`)
                e += 1;
            }

            let salesTurnoverTotal = totalSum(salesTurnoverArr);
            let expensesTotal = totalSum(expensesArr);
            let profitTotal = totalSum(profitData);

            $('#breakEvenPointTable thead tr').append(`<th class="text-end">Total</th>`)
            $('#salesTurnover').append(`<td class="text-end">${roundOff(salesTurnoverTotal,2)}</td>`)
            $('#expenses').append(`<td class="text-end">${roundOff(expensesTotal,2)}</td>`)
            $('#profit').append(`<td class="text-end">${roundOff(profitTotal,2)}</td>`)

            if (BreakEvenChart == null) {
                BreakEvenChart = new Chart(ctx, chartData);
            }
        },
        error: function (data) {
            console.log(data)
        }

    });
    //Disable modal input fields
    let saveBtn = $("#breakEvenModal").find(".salvesta")
    changeSave(saveBtn)
    $("#breakEvenModal").find('.delRow').addClass('d-none')
}

//Get repost results and populate tables and chart

function getReportResults(x) {
    let reqBody = { "company_id": x };
    $("#error").addClass("d-none").text("")
    $.ajax({
        url: "/analysisResults",
        type: 'POST',
        dataType: "json",
        data: reqBody,
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            let results = data.results;
            let profRepSche = results.Profit_report_schema;

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
                let td;
                if (results.ReturnOnTotalAssets.length === 1) {
                    td = `<td class="text-end">${returnOnTotalAssets.returnOnTotalAssets}%</td><td></td>`
                } else {
                    td = `<td class="text-end">${returnOnTotalAssets.returnOnTotalAssets}%</td>`
                }
                $('#returnOnTotalAssets').append(td)
            })
            $.each(results.ReturnOnInvestment, function (i, returnOnInvestment) {
                let td;
                if (results.ReturnOnInvestment.length === 1) {
                    td = `<td class="text-end">${returnOnInvestment.returnOnInvestment}%</td><td></td>`
                } else {
                    td = `<td class="text-end">${returnOnInvestment.returnOnInvestment}%</td>`
                }
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

            //Bilansi Horisontaalanalüüs

            $.each(results.HorizontalAnalysisBalances, function (i, data) {
                let th = `<th scope="col" class="text-end">${data.year}</th><th class="text-end" scope="col">Absoluut</th><th class="text-end" scope="col">Protsent</th>`
                $('#balanceHorizontal thead tr').append(th)

                $.each(data.cash, function (i, cash) {
                    let td = `<td class="text-end">${cash}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${cash}%</td>`
                    }
                    $("#cashHa").append(td)
                })
                $.each(data.stInvestments, function (i, stInvestments) {
                    let td = `<td class="text-end">${stInvestments}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${stInvestments}%</td>`
                    }
                    $("#stInvestmentsHa").append(td)
                })
                $.each(data.receivablesPrepayments, function (i, receivablesPrepayments) {
                    let td = `<td class="text-end">${receivablesPrepayments}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${receivablesPrepayments}%</td>`
                    }
                    $("#receivablesPrepaymentsHa").append(td)
                })
                $.each(data.inventories, function (i, inventories) {
                    let td = `<td class="text-end">${inventories}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${inventories}%</td>`
                    }
                    $("#inventoriesHa").append(td)
                })
                $.each(data.stBiologicalAssets, function (i, stBiologicalAssets) {
                    let td = `<td class="text-end">${stBiologicalAssets}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${stBiologicalAssets}%</td>`
                    }
                    $("#stBiologicalAssetsHa").append(td)
                })
                $.each(data.totalCurrentAssets, function (i, totalCurrentAssets) {
                    let td = `<td class="text-end">${totalCurrentAssets}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${totalCurrentAssets}%</td>`
                    }
                    $("#totalCurrentAssetsHa").append(td)
                })
                $.each(data.investmentsSubUnder, function (i, investmentsSubUnder) {
                    let td = `<td class="text-end">${investmentsSubUnder}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${investmentsSubUnder}%</td>`
                    }
                    $("#investmentsSubUnderHa").append(td)
                })
                $.each(data.ltInvestments, function (i, ltInvestments) {
                    let td = `<td class="text-end">${ltInvestments}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${ltInvestments}%</td>`
                    }
                    $("#ltInvestmentsHa").append(td)
                })
                $.each(data.ltReceivablesPrepayments, function (i, ltReceivablesPrepayments) {
                    let td = `<td class="text-end">${ltReceivablesPrepayments}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${ltReceivablesPrepayments}%</td>`
                    }
                    $("#ltReceivablesPrepaymentsHa").append(td)
                })
                $.each(data.realEstateInv, function (i, realEstateInv) {
                    let td = `<td class="text-end">${realEstateInv}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${realEstateInv}%</td>`
                    }
                    $("#realEstateInvHa").append(td)
                })
                $.each(data.tangibleAssets, function (i, tangibleAssets) {
                    let td = `<td class="text-end">${tangibleAssets}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${tangibleAssets}%</td>`
                    }
                    $("#tangibleAssetsHa").append(td)
                })
                $.each(data.ltBiologicalAssets, function (i, ltBiologicalAssets) {
                    let td = `<td class="text-end">${ltBiologicalAssets}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${ltBiologicalAssets}%</td>`
                    }
                    $("#ltBiologicalAssetsHa").append(td)
                })
                $.each(data.intangibleFixedAssets, function (i, intangibleFixedAssets) {
                    let td = `<td class="text-end">${intangibleFixedAssets}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${intangibleFixedAssets}%</td>`
                    }
                    $("#intangibleFixedAssetsHa").append(td)
                })
                $.each(data.totalFixedAssets, function (i, totalFixedAssets) {
                    let td = `<td class="text-end">${totalFixedAssets}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${totalFixedAssets}%</td>`
                    }
                    $("#totalFixedAssetsHa").append(td)
                })
                $.each(data.totalAssets, function (i, totalAssets) {
                    let td = `<td class="text-end">${totalAssets}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${totalAssets}%</td>`
                    }
                    $("#totalAssetsHa").append(td)
                })
                $.each(data.stLoanLiabilities, function (i, stLoanLiabilities) {
                    let td = `<td class="text-end">${stLoanLiabilities}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${stLoanLiabilities}%</td>`
                    }
                    $("#stLoanLiabilitiesHa").append(td)
                })
                $.each(data.debtsPrepaymentsReceived, function (i, debtsPrepaymentsReceived) {
                    let td = `<td class="text-end">${debtsPrepaymentsReceived}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${debtsPrepaymentsReceived}%</td>`
                    }
                    $("#debtsPrepaymentsReceivedHa").append(td)
                })
                $.each(data.stProvisions, function (i, stProvisions) {
                    let td = `<td class="text-end">${stProvisions}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${stProvisions}%</td>`
                    }
                    $("#stProvisionsHa").append(td)
                })
                $.each(data.stTargetedFinancings, function (i, stTargetedFinancings) {
                    let td = `<td class="text-end">${stTargetedFinancings}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${stTargetedFinancings}%</td>`
                    }
                    $("#stTargetedFinancingsHa").append(td)
                })
                $.each(data.totalCurrentLiabilities, function (i, totalCurrentLiabilities) {
                    let td = `<td class="text-end">${totalCurrentLiabilities}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${totalCurrentLiabilities}%</td>`
                    }
                    $("#totalCurrentLiabilitiesHa").append(td)
                })
                $.each(data.ltLoanLiabilities, function (i, ltLoanLiabilities) {
                    let td = `<td class="text-end">${ltLoanLiabilities}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${ltLoanLiabilities}%</td>`
                    }
                    $("#ltLoanLiabilitiesHa").append(td)
                })
                $.each(data.ltDebtsPrepayments, function (i, ltDebtsPrepayments) {
                    let td = `<td class="text-end">${ltDebtsPrepayments}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${ltDebtsPrepayments}%</td>`
                    }
                    $("#ltDebtsPrepaymentsHa").append(td)
                })
                $.each(data.ltProvisions, function (i, ltProvisions) {
                    let td = `<td class="text-end">${ltProvisions}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${ltProvisions}%</td>`
                    }
                    $("#ltProvisionsHa").append(td)
                })
                $.each(data.ltTargetedFinancings, function (i, ltTargetedFinancings) {
                    let td = `<td class="text-end">${ltTargetedFinancings}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${ltTargetedFinancings}%</td>`
                    }
                    $("#ltTargetedFinancingsHa").append(td)
                })
                $.each(data.ltLiabilitiesTotal, function (i, ltLiabilitiesTotal) {
                    let td = `<td class="text-end">${ltLiabilitiesTotal}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${ltLiabilitiesTotal}%</td>`
                    }
                    $("#ltLiabilitiesTotalHa").append(td)
                })
                $.each(data.totalLiabilities, function (i, totalLiabilities) {
                    let td = `<td class="text-end">${totalLiabilities}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${totalLiabilities}%</td>`
                    }
                    $("#totalLiabilitiesHa").append(td)
                })
                $.each(data.shareCapital, function (i, shareCapital) {
                    let td = `<td class="text-end">${shareCapital}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${shareCapital}%</td>`
                    }
                    $("#shareCapitalHa").append(td)
                })
                $.each(data.unregisteredShare, function (i, unregisteredShare) {
                    let td = `<td class="text-end">${unregisteredShare}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${unregisteredShare}%</td>`
                    }
                    $("#unregisteredShareHa").append(td)
                })
                $.each(data.unpaidShareCapital, function (i, unpaidShareCapital) {
                    let td = `<td class="text-end">${unpaidShareCapital}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${unpaidShareCapital}%</td>`
                    }
                    $("#unpaidShareCapitalHa").append(td)
                })
                $.each(data.sharePremium, function (i, sharePremium) {
                    let td = `<td class="text-end">${sharePremium}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${sharePremium}%</td>`
                    }
                    $("#sharePremiumHa").append(td)
                })
                $.each(data.lessOwnShares, function (i, lessOwnShares) {
                    let td = `<td class="text-end">${lessOwnShares}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${lessOwnShares}%</td>`
                    }
                    $("#lessOwnSharesHa").append(td)
                })
                $.each(data.legalReserve, function (i, legalReserve) {
                    let td = `<td class="text-end">${legalReserve}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${legalReserve}%</td>`
                    }
                    $("#legalReserveHa").append(td)
                })
                $.each(data.otherReserves, function (i, otherReserves) {
                    let td = `<td class="text-end">${otherReserves}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${otherReserves}%</td>`
                    }
                    $("#otherReservesHa").append(td)
                })
                $.each(data.otherOwnersEquity, function (i, otherOwnersEquity) {
                    let td = `<td class="text-end">${otherOwnersEquity}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${otherOwnersEquity}%</td>`
                    }
                    $("#otherOwnersEquityHa").append(td)
                })
                $.each(data.retainedProfitLoss, function (i, retainedProfitLoss) {
                    let td = `<td class="text-end">${retainedProfitLoss}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${retainedProfitLoss}%</td>`
                    }
                    $("#retainedProfitLossHa").append(td)
                })
                $.each(data.financialYearNetProfitLoss, function (i, financialYearNetProfitLoss) {
                    let td = `<td class="text-end">${financialYearNetProfitLoss}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${financialYearNetProfitLoss}%</td>`
                    }
                    $("#financialYearNetProfitLossHa").append(td)
                })
                $.each(data.ownersEquityTotal, function (i, ownersEquityTotal) {
                    let td = `<td class="text-end">${ownersEquityTotal}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${ownersEquityTotal}%</td>`
                    }
                    $("#ownersEquityTotalHa").append(td)
                })
                $.each(data.totalLiabilitiesOwnersEquity, function (i, totalLiabilitiesOwnersEquity) {
                    let td = `<td class="text-end">${totalLiabilitiesOwnersEquity}</td>`
                    if (i === 2) {
                        td = `<td class="text-end">${totalLiabilitiesOwnersEquity}%</td>`
                    }
                    $("#totalLiabilitiesOwnersEquityHa").append(td)
                })
            })

            //Kasumiaruande horisontaalanalüüs

            $.each(results.HorizontalAnalysisProfitReps, function (i, data) {
                let th = `<th scope="col" class="text-end">${data.year}</th><th class="text-end" scope="col">Absoluut</th><th class="text-end" scope="col">Protsent</th>`
                $('#profReportsHorizontal thead tr').append(th)

                if (profRepSche == 1) {
                    $.each(data.salesRevenue, function (i, salesRevenue) {
                        let td = `<td class="text-end">${salesRevenue}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${salesRevenue}%</td>`
                        }
                        $("#salesRevenueHa").append(td)
                    })
                    $.each(data.creditSalesRevenueTotal, function (i, creditSalesRevenueTotal) {
                        let td = `<td class="text-end">${creditSalesRevenueTotal}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${creditSalesRevenueTotal}%</td>`
                        }
                        $("#creditSalesRevenueTotalHa").append(td)
                    })
                    $.each(data.otherOperatingRevenue, function (i, otherOperatingRevenue) {
                        let td = `<td class="text-end">${otherOperatingRevenue}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${otherOperatingRevenue}%</td>`
                        }
                        $("#otherOperatingRevenueHa").append(td)
                    })
                    $.each(data.agriGoodsWip, function (i, agriGoodsWip) {
                        let td = `<td class="text-end">${agriGoodsWip}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${agriGoodsWip}%</td>`
                        }
                        $("#agriGoodsWipHa").append(td)
                    })
                    $.each(data.bioAssetsProfitLoss, function (i, bioAssetsProfitLoss) {
                        let td = `<td class="text-end">${bioAssetsProfitLoss}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${bioAssetsProfitLoss}%</td>`
                        }
                        $("#bioAssetsProfitLossHa").append(td)
                    })
                    $.each(data.changesGoodsWip, function (i, changesGoodsWip) {
                        let td = `<td class="text-end">${changesGoodsWip}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${changesGoodsWip}%</td>`
                        }
                        $("#changesGoodsWipHa").append(td)
                    })
                    $.each(data.ownPurposeCapitalised, function (i, ownPurposeCapitalised) {
                        let td = `<td class="text-end">${ownPurposeCapitalised}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${ownPurposeCapitalised}%</td>`
                        }
                        $("#ownPurposeCapitalisedHa").append(td)
                    })
                    $.each(data.goodsRawMaterialsServices, function (i, goodsRawMaterialsServices) {
                        let td = `<td class="text-end">${goodsRawMaterialsServices}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${goodsRawMaterialsServices}%</td>`
                        }
                        $("#goodsRawMaterialsServicesHa").append(td)
                    })
                    $.each(data.otherOperatingExpenses, function (i, otherOperatingExpenses) {
                        let td = `<td class="text-end">${otherOperatingExpenses}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${otherOperatingExpenses}%</td>`
                        }
                        $("#otherOperatingExpensesHa").append(td)
                    })
                    $.each(data.wagesSalaries, function (i, wagesSalaries) {
                        let td = `<td class="text-end">${wagesSalaries}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${wagesSalaries}%</td>`
                        }
                        $("#wagesSalariesHa").append(td)
                    })
                    $.each(data.fixedAssetsDepreciationImpairment, function (i, fixedAssetsDepreciationImpairment) {
                        let td = `<td class="text-end">${fixedAssetsDepreciationImpairment}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${fixedAssetsDepreciationImpairment}%</td>`
                        }
                        $("#fixedAssetsDepreciationImpairmentHa").append(td)
                    })
                    $.each(data.currentAssetsDiscounts, function (i, currentAssetsDiscounts) {
                        let td = `<td class="text-end">${currentAssetsDiscounts}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${currentAssetsDiscounts}%</td>`
                        }
                        $("#currentAssetsDiscountsHa").append(td)
                    })
                    $.each(data.otherOperatingCharges, function (i, otherOperatingCharges) {
                        let td = `<td class="text-end">${otherOperatingCharges}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${otherOperatingCharges}%</td>`
                        }
                        $("#otherOperatingChargesHa").append(td)
                    })
                    $.each(data.earningsMinusLosses, function (i, earningsMinusLosses) {
                        let td = `<td class="text-end">${earningsMinusLosses}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${earningsMinusLosses}%</td>`
                        }
                        $("#earningsMinusLossesHa").append(td)
                    })
                    $.each(data.profitLossSubsidiaries, function (i, profitLossSubsidiaries) {
                        let td = `<td class="text-end">${profitLossSubsidiaries}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${profitLossSubsidiaries}%</td>`
                        }
                        $("#profitLossSubsidiariesHa").append(td)
                    })
                    $.each(data.profitLossAssociated, function (i, profitLossAssociated) {
                        let td = `<td class="text-end">${profitLossAssociated}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${profitLossAssociated}%</td>`
                        }
                        $("#profitLossAssociatedHa").append(td)
                    })
                    $.each(data.profitLossFinancialInvestments, function (i, profitLossFinancialInvestments) {
                        let td = `<td class="text-end">${profitLossFinancialInvestments}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${profitLossFinancialInvestments}%</td>`
                        }
                        $("#profitLossFinancialInvestmentsHa").append(td)
                    })
                    $.each(data.interestIncome, function (i, interestIncome) {
                        let td = `<td class="text-end">${interestIncome}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${interestIncome}%</td>`
                        }
                        $("#interestIncomeHa").append(td)
                    })
                    $.each(data.interestExpense, function (i, interestExpense) {
                        let td = `<td class="text-end">${interestExpense}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${interestExpense}%</td>`
                        }
                        $("#interestExpenseHa").append(td)
                    })
                    $.each(data.otherFinancialIncomeExpenses, function (i, otherFinancialIncomeExpenses) {
                        let td = `<td class="text-end">${otherFinancialIncomeExpenses}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${otherFinancialIncomeExpenses}%</td>`
                        }
                        $("#otherFinancialIncomeExpensesHa").append(td)
                    })
                    $.each(data.earningsMinusLossesBeforeIncomeExpenses, function (i, earningsMinusLossesBeforeIncomeExpenses) {
                        let td = `<td class="text-end">${earningsMinusLossesBeforeIncomeExpenses}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${earningsMinusLossesBeforeIncomeExpenses}%</td>`
                        }
                        $("#earningsMinusLossesBeforeIncomeExpensesHa").append(td)
                    })
                    $.each(data.incomeTaxExpense, function (i, incomeTaxExpense) {
                        let td = `<td class="text-end">${incomeTaxExpense}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${incomeTaxExpense}%</td>`
                        }
                        $("#incomeTaxExpenseHa").append(td)
                    })
                    $.each(data.financialYearEarningsMinusLosses, function (i, financialYearEarningsMinusLosses) {
                        let td = `<td class="text-end">${financialYearEarningsMinusLosses}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${financialYearEarningsMinusLosses}%</td>`
                        }
                        $("#financialYearEarningsMinusLossesHa").append(td)
                    })
                } else {
                    $.each(data.salesRevenue, function (i, salesRevenue) {
                        let td = `<td class="text-end">${salesRevenue}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${salesRevenue}%</td>`
                        }
                        $("#salesRevenueHa").append(td)
                    })
                    $.each(data.creditSalesRevenueTotal, function (i, creditSalesRevenueTotal) {
                        let td = `<td class="text-end">${creditSalesRevenueTotal}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${creditSalesRevenueTotal}%</td>`
                        }
                        $("#creditSalesRevenueTotalHa").append(td)
                    })
                    $.each(data.salesCost, function (i, salesCost) {
                        let td = `<td class="text-end">${salesCost}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${salesCost}%</td>`
                        }
                        $("#salesCostHa").append(td)
                    })
                    $.each(data.grossProfitMinusLoss, function (i, grossProfitMinusLoss) {
                        let td = `<td class="text-end">${grossProfitMinusLoss}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${grossProfitMinusLoss}%</td>`
                        }
                        $("#grossProfitMinusLossHa").append(td)
                    })
                    $.each(data.bioAssetsProfitLoss, function (i, bioAssetsProfitLoss) {
                        let td = `<td class="text-end">${bioAssetsProfitLoss}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${bioAssetsProfitLoss}%</td>`
                        }
                        $("#bioAssetsProfitLossHa").append(td)
                    })
                    $.each(data.marketingExpenses, function (i, marketingExpenses) {
                        let td = `<td class="text-end">${marketingExpenses}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${marketingExpenses}%</td>`
                        }
                        $("#marketingExpensesHa").append(td)
                    })
                    $.each(data.administrativeExpenses, function (i, administrativeExpenses) {
                        let td = `<td class="text-end">${administrativeExpenses}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${administrativeExpenses}%</td>`
                        }
                        $("#administrativeExpensesHa").append(td)
                    })
                    $.each(data.otherOperatingRevenue, function (i, otherOperatingRevenue) {
                        let td = `<td class="text-end">${otherOperatingRevenue}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${otherOperatingRevenue}%</td>`
                        }
                        $("#otherOperatingRevenueHa").append(td)
                    })
                    $.each(data.otherOperatingCharges, function (i, otherOperatingCharges) {
                        let td = `<td class="text-end">${otherOperatingCharges}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${otherOperatingCharges}%</td>`
                        }
                        $("#otherOperatingChargesHa").append(td)
                    })
                    $.each(data.earningsMinusLosses, function (i, earningsMinusLosses) {
                        let td = `<td class="text-end">${earningsMinusLosses}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${earningsMinusLosses}%</td>`
                        }
                        $("#earningsMinusLossesHa").append(td)
                    })
                    $.each(data.profitLossSubsidiaries, function (i, profitLossSubsidiaries) {
                        let td = `<td class="text-end">${profitLossSubsidiaries}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${profitLossSubsidiaries}%</td>`
                        }
                        $("#profitLossSubsidiariesHa").append(td)
                    })
                    $.each(data.profitLossAssociated, function (i, profitLossAssociated) {
                        let td = `<td class="text-end">${profitLossAssociated}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${profitLossAssociated}%</td>`
                        }
                        $("#profitLossAssociatedHa").append(td)
                    })
                    $.each(data.profitLossFinancialInvestments, function (i, profitLossFinancialInvestments) {
                        let td = `<td class="text-end">${profitLossFinancialInvestments}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${profitLossFinancialInvestments}%</td>`
                        }
                        $("#profitLossFinancialInvestmentsHa").append(td)
                    })
                    $.each(data.interestIncome, function (i, interestIncome) {
                        let td = `<td class="text-end">${interestIncome}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${interestIncome}%</td>`
                        }
                        $("#interestIncomeHa").append(td)
                    })
                    $.each(data.interestExpense, function (i, interestExpense) {
                        let td = `<td class="text-end">${interestExpense}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${interestExpense}%</td>`
                        }
                        $("#interestExpenseHa").append(td)
                    })
                    $.each(data.otherFinancialIncomeExpenses, function (i, otherFinancialIncomeExpenses) {
                        let td = `<td class="text-end">${otherFinancialIncomeExpenses}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${otherFinancialIncomeExpenses}%</td>`
                        }
                        $("#otherFinancialIncomeExpensesHa").append(td)
                    })
                    $.each(data.earningsMinusLossesBeforeIncomeExpenses, function (i, earningsMinusLossesBeforeIncomeExpenses) {
                        let td = `<td class="text-end">${earningsMinusLossesBeforeIncomeExpenses}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${earningsMinusLossesBeforeIncomeExpenses}%</td>`
                        }
                        $("#earningsMinusLossesBeforeIncomeExpensesHa").append(td)
                    })
                    $.each(data.incomeTaxExpense, function (i, incomeTaxExpense) {
                        let td = `<td class="text-end">${incomeTaxExpense}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${incomeTaxExpense}%</td>`
                        }
                        $("#incomeTaxExpenseHa").append(td)
                    })
                    $.each(data.financialYearEarningsMinusLosses, function (i, financialYearEarningsMinusLosses) {
                        let td = `<td class="text-end">${financialYearEarningsMinusLosses}</td>`
                        if (i === 2) {
                            td = `<td class="text-end">${financialYearEarningsMinusLosses}%</td>`
                        }
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
                    if (i === 1) {
                        td = `<td class="text-end">${cash}%</td>`
                    }
                    $("#cashVa").append(td)
                })
                $.each(data.stInvestments, function (i, stInvestments) {
                    let td = `<td class="text-end">${stInvestments}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${stInvestments}%</td>`
                    }
                    $("#stInvestmentsVa").append(td)
                })
                $.each(data.receivablesPrepayments, function (i, receivablesPrepayments) {
                    let td = `<td class="text-end">${receivablesPrepayments}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${receivablesPrepayments}%</td>`
                    }
                    $("#receivablesPrepaymentsVa").append(td)
                })
                $.each(data.inventories, function (i, inventories) {
                    let td = `<td class="text-end">${inventories}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${inventories}%</td>`
                    }
                    $("#inventoriesVa").append(td)
                })
                $.each(data.stBiologicalAssets, function (i, stBiologicalAssets) {
                    let td = `<td class="text-end">${stBiologicalAssets}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${stBiologicalAssets}%</td>`
                    }
                    $("#stBiologicalAssetsVa").append(td)
                })
                $.each(data.totalCurrentAssets, function (i, totalCurrentAssets) {
                    let td = `<td class="text-end">${totalCurrentAssets}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${totalCurrentAssets}%</td>`
                    }
                    $("#totalCurrentAssetsVa").append(td)
                })
                $.each(data.investmentsSubUnder, function (i, investmentsSubUnder) {
                    let td = `<td class="text-end">${investmentsSubUnder}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${investmentsSubUnder}%</td>`
                    }
                    $("#investmentsSubUnderVa").append(td)
                })
                $.each(data.ltInvestments, function (i, ltInvestments) {
                    let td = `<td class="text-end">${ltInvestments}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${ltInvestments}%</td>`
                    }
                    $("#ltInvestmentsVa").append(td)
                })
                $.each(data.ltReceivablesPrepayments, function (i, ltReceivablesPrepayments) {
                    let td = `<td class="text-end">${ltReceivablesPrepayments}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${ltReceivablesPrepayments}%</td>`
                    }
                    $("#ltReceivablesPrepaymentsVa").append(td)
                })
                $.each(data.realEstateInv, function (i, realEstateInv) {
                    let td = `<td class="text-end">${realEstateInv}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${realEstateInv}%</td>`
                    }
                    $("#realEstateInvVa").append(td)
                })
                $.each(data.tangibleAssets, function (i, tangibleAssets) {
                    let td = `<td class="text-end">${tangibleAssets}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${tangibleAssets}%</td>`
                    }
                    $("#tangibleAssetsVa").append(td)
                })
                $.each(data.ltBiologicalAssets, function (i, ltBiologicalAssets) {
                    let td = `<td class="text-end">${ltBiologicalAssets}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${ltBiologicalAssets}%</td>`
                    }
                    $("#ltBiologicalAssetsVa").append(td)
                })
                $.each(data.intangibleFixedAssets, function (i, intangibleFixedAssets) {
                    let td = `<td class="text-end">${intangibleFixedAssets}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${intangibleFixedAssets}%</td>`
                    }
                    $("#intangibleFixedAssetsVa").append(td)
                })
                $.each(data.totalFixedAssets, function (i, totalFixedAssets) {
                    let td = `<td class="text-end">${totalFixedAssets}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${totalFixedAssets}%</td>`
                    }
                    $("#totalFixedAssetsVa").append(td)
                })
                $.each(data.totalAssets, function (i, totalAssets) {
                    let td = `<td class="text-end">${totalAssets}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${totalAssets}%</td>`
                    }
                    $("#totalAssetsVa").append(td)
                })
                $.each(data.stLoanLiabilities, function (i, stLoanLiabilities) {
                    let td = `<td class="text-end">${stLoanLiabilities}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${stLoanLiabilities}%</td>`
                    }
                    $("#stLoanLiabilitiesVa").append(td)
                })
                $.each(data.debtsPrepaymentsReceived, function (i, debtsPrepaymentsReceived) {
                    let td = `<td class="text-end">${debtsPrepaymentsReceived}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${debtsPrepaymentsReceived}%</td>`
                    }
                    $("#debtsPrepaymentsReceivedVa").append(td)
                })
                $.each(data.stProvisions, function (i, stProvisions) {
                    let td = `<td class="text-end">${stProvisions}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${stProvisions}%</td>`
                    }
                    $("#stProvisionsVa").append(td)
                })
                $.each(data.stTargetedFinancings, function (i, stTargetedFinancings) {
                    let td = `<td class="text-end">${stTargetedFinancings}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${stTargetedFinancings}%</td>`
                    }
                    $("#stTargetedFinancingsVa").append(td)
                })
                $.each(data.totalCurrentLiabilities, function (i, totalCurrentLiabilities) {
                    let td = `<td class="text-end">${totalCurrentLiabilities}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${totalCurrentLiabilities}%</td>`
                    }
                    $("#totalCurrentLiabilitiesVa").append(td)
                })
                $.each(data.ltLoanLiabilities, function (i, ltLoanLiabilities) {
                    let td = `<td class="text-end">${ltLoanLiabilities}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${ltLoanLiabilities}%</td>`
                    }
                    $("#ltLoanLiabilitiesVa").append(td)
                })
                $.each(data.ltDebtsPrepayments, function (i, ltDebtsPrepayments) {
                    let td = `<td class="text-end">${ltDebtsPrepayments}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${ltDebtsPrepayments}%</td>`
                    }
                    $("#ltDebtsPrepaymentsVa").append(td)
                })
                $.each(data.ltProvisions, function (i, ltProvisions) {
                    let td = `<td class="text-end">${ltProvisions}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${ltProvisions}%</td>`
                    }
                    $("#ltProvisionsVa").append(td)
                })
                $.each(data.ltTargetedFinancings, function (i, ltTargetedFinancings) {
                    let td = `<td class="text-end">${ltTargetedFinancings}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${ltTargetedFinancings}%</td>`
                    }
                    $("#ltTargetedFinancingsVa").append(td)
                })
                $.each(data.ltLiabilitiesTotal, function (i, ltLiabilitiesTotal) {
                    let td = `<td class="text-end">${ltLiabilitiesTotal}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${ltLiabilitiesTotal}%</td>`
                    }
                    $("#ltLiabilitiesTotalVa").append(td)
                })
                $.each(data.totalLiabilities, function (i, totalLiabilities) {
                    let td = `<td class="text-end">${totalLiabilities}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${totalLiabilities}%</td>`
                    }
                    $("#totalLiabilitiesVa").append(td)
                })
                $.each(data.shareCapital, function (i, shareCapital) {
                    let td = `<td class="text-end">${shareCapital}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${shareCapital}%</td>`
                    }
                    $("#shareCapitalVa").append(td)
                })
                $.each(data.unregisteredShare, function (i, unregisteredShare) {
                    let td = `<td class="text-end">${unregisteredShare}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${unregisteredShare}%</td>`
                    }
                    $("#unregisteredShareVa").append(td)
                })
                $.each(data.unpaidShareCapital, function (i, unpaidShareCapital) {
                    let td = `<td class="text-end">${unpaidShareCapital}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${unpaidShareCapital}%</td>`
                    }
                    $("#unpaidShareCapitalVa").append(td)
                })
                $.each(data.sharePremium, function (i, sharePremium) {
                    let td = `<td class="text-end">${sharePremium}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${sharePremium}%</td>`
                    }
                    $("#sharePremiumVa").append(td)
                })
                $.each(data.lessOwnShares, function (i, lessOwnShares) {
                    let td = `<td class="text-end">${lessOwnShares}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${lessOwnShares}%</td>`
                    }
                    $("#lessOwnSharesVa").append(td)
                })
                $.each(data.legalReserve, function (i, legalReserve) {
                    let td = `<td class="text-end">${legalReserve}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${legalReserve}%</td>`
                    }
                    $("#legalReserveVa").append(td)
                })
                $.each(data.otherReserves, function (i, otherReserves) {
                    let td = `<td class="text-end">${otherReserves}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${otherReserves}%</td>`
                    }
                    $("#otherReservesVa").append(td)
                })
                $.each(data.otherOwnersEquity, function (i, otherOwnersEquity) {
                    let td = `<td class="text-end">${otherOwnersEquity}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${otherOwnersEquity}%</td>`
                    }
                    $("#otherOwnersEquityVa").append(td)
                })
                $.each(data.retainedProfitLoss, function (i, retainedProfitLoss) {
                    let td = `<td class="text-end">${retainedProfitLoss}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${retainedProfitLoss}%</td>`
                    }
                    $("#retainedProfitLossVa").append(td)
                })
                $.each(data.financialYearNetProfitLoss, function (i, financialYearNetProfitLoss) {
                    let td = `<td class="text-end">${financialYearNetProfitLoss}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${financialYearNetProfitLoss}%</td>`
                    }
                    $("#financialYearNetProfitLossVa").append(td)
                })
                $.each(data.ownersEquityTotal, function (i, ownersEquityTotal) {
                    let td = `<td class="text-end">${ownersEquityTotal}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${ownersEquityTotal}%</td>`
                    }
                    $("#ownersEquityTotalVa").append(td)
                })
                $.each(data.totalLiabilitiesOwnersEquity, function (i, totalLiabilitiesOwnersEquity) {
                    let td = `<td class="text-end">${totalLiabilitiesOwnersEquity}</td>`
                    if (i === 1) {
                        td = `<td class="text-end">${totalLiabilitiesOwnersEquity}%</td>`
                    }
                    $("#totalLiabilitiesOwnersEquityVa").append(td)
                })

            })

            //Kasumiaruande vertikaalanalüüs

            $.each(results.VerticalAnalysisProfitReps, function (i, data) {
                let th = `<th scope="col" class="text-end">${data.year}</th><th class="text-end" scope="col">% müügitulust</th>`
                $('#profReportsVertical thead tr').append(th)
                if (profRepSche === 1) {
                    $.each(data.salesRevenue, function (i, salesRevenue) {
                        let td = `<td class="text-end">${salesRevenue}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${salesRevenue}%</td>`
                        }
                        $("#salesRevenueVa").append(td)
                    })
                    $.each(data.creditSalesRevenueTotal, function (i, creditSalesRevenueTotal) {
                        let td = `<td class="text-end">${creditSalesRevenueTotal}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${creditSalesRevenueTotal}%</td>`
                        }
                        $("#creditSalesRevenueTotalVa").append(td)
                    })
                    $.each(data.otherOperatingRevenue, function (i, otherOperatingRevenue) {
                        let td = `<td class="text-end">${otherOperatingRevenue}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${otherOperatingRevenue}%</td>`
                        }
                        $("#otherOperatingRevenueVa").append(td)
                    })
                    $.each(data.agriGoodsWip, function (i, agriGoodsWip) {
                        let td = `<td class="text-end">${agriGoodsWip}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${agriGoodsWip}%</td>`
                        }
                        $("#agriGoodsWipVa").append(td)
                    })
                    $.each(data.bioAssetsProfitLoss, function (i, bioAssetsProfitLoss) {
                        let td = `<td class="text-end">${bioAssetsProfitLoss}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${bioAssetsProfitLoss}%</td>`
                        }
                        $("#bioAssetsProfitLossVa").append(td)
                    })
                    $.each(data.changesGoodsWip, function (i, changesGoodsWip) {
                        let td = `<td class="text-end">${changesGoodsWip}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${changesGoodsWip}%</td>`
                        }
                        $("#changesGoodsWipVa").append(td)
                    })
                    $.each(data.ownPurposeCapitalised, function (i, ownPurposeCapitalised) {
                        let td = `<td class="text-end">${ownPurposeCapitalised}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${ownPurposeCapitalised}%</td>`
                        }
                        $("#ownPurposeCapitalisedVa").append(td)
                    })
                    $.each(data.goodsRawMaterialsServices, function (i, goodsRawMaterialsServices) {
                        let td = `<td class="text-end">${goodsRawMaterialsServices}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${goodsRawMaterialsServices}%</td>`
                        }
                        $("#goodsRawMaterialsServicesVa").append(td)
                    })
                    $.each(data.otherOperatingExpenses, function (i, otherOperatingExpenses) {
                        let td = `<td class="text-end">${otherOperatingExpenses}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${otherOperatingExpenses}%</td>`
                        }
                        $("#otherOperatingExpensesVa").append(td)
                    })
                    $.each(data.wagesSalaries, function (i, wagesSalaries) {
                        let td = `<td class="text-end">${wagesSalaries}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${wagesSalaries}%</td>`
                        }
                        $("#wagesSalariesVa").append(td)
                    })
                    $.each(data.fixedAssetsDepreciationImpairment, function (i, fixedAssetsDepreciationImpairment) {
                        let td = `<td class="text-end">${fixedAssetsDepreciationImpairment}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${fixedAssetsDepreciationImpairment}%</td>`
                        }
                        $("#fixedAssetsDepreciationImpairmentVa").append(td)
                    })
                    $.each(data.currentAssetsDiscounts, function (i, currentAssetsDiscounts) {
                        let td = `<td class="text-end">${currentAssetsDiscounts}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${currentAssetsDiscounts}%</td>`
                        }
                        $("#currentAssetsDiscountsVa").append(td)
                    })
                    $.each(data.otherOperatingCharges, function (i, otherOperatingCharges) {
                        let td = `<td class="text-end">${otherOperatingCharges}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${otherOperatingCharges}%</td>`
                        }
                        $("#otherOperatingChargesVa").append(td)
                    })
                    $.each(data.earningsMinusLosses, function (i, earningsMinusLosses) {
                        let td = `<td class="text-end">${earningsMinusLosses}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${earningsMinusLosses}%</td>`
                        }
                        $("#earningsMinusLossesVa").append(td)
                    })
                    $.each(data.profitLossSubsidiaries, function (i, profitLossSubsidiaries) {
                        let td = `<td class="text-end">${profitLossSubsidiaries}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${profitLossSubsidiaries}%</td>`
                        }
                        $("#profitLossSubsidiariesVa").append(td)
                    })
                    $.each(data.profitLossAssociated, function (i, profitLossAssociated) {
                        let td = `<td class="text-end">${profitLossAssociated}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${profitLossAssociated}%</td>`
                        }
                        $("#profitLossAssociatedVa").append(td)
                    })
                    $.each(data.profitLossFinancialInvestments, function (i, profitLossFinancialInvestments) {
                        let td = `<td class="text-end">${profitLossFinancialInvestments}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${profitLossFinancialInvestments}%</td>`
                        }
                        $("#profitLossFinancialInvestmentsVa").append(td)
                    })
                    $.each(data.interestIncome, function (i, interestIncome) {
                        let td = `<td class="text-end">${interestIncome}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${interestIncome}%</td>`
                        }
                        $("#interestIncomeVa").append(td)
                    })
                    $.each(data.interestExpense, function (i, interestExpense) {
                        let td = `<td class="text-end">${interestExpense}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${interestExpense}%</td>`
                        }
                        $("#interestExpenseVa").append(td)
                    })
                    $.each(data.otherFinancialIncomeExpenses, function (i, otherFinancialIncomeExpenses) {
                        let td = `<td class="text-end">${otherFinancialIncomeExpenses}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${otherFinancialIncomeExpenses}%</td>`
                        }
                        $("#otherFinancialIncomeExpensesVa").append(td)
                    })
                    $.each(data.earningsMinusLossesBeforeIncomeExpenses, function (i, earningsMinusLossesBeforeIncomeExpenses) {
                        let td = `<td class="text-end">${earningsMinusLossesBeforeIncomeExpenses}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${earningsMinusLossesBeforeIncomeExpenses}%</td>`
                        }
                        $("#earningsMinusLossesBeforeIncomeExpensesVa").append(td)
                    })
                    $.each(data.incomeTaxExpense, function (i, incomeTaxExpense) {
                        let td = `<td class="text-end">${incomeTaxExpense}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${incomeTaxExpense}%</td>`
                        }
                        $("#incomeTaxExpenseVa").append(td)
                    })
                    $.each(data.financialYearEarningsMinusLosses, function (i, financialYearEarningsMinusLosses) {
                        let td = `<td class="text-end">${financialYearEarningsMinusLosses}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${financialYearEarningsMinusLosses}%</td>`
                        }
                        $("#financialYearEarningsMinusLossesVa").append(td)
                    })
                } else {
                    $.each(data.salesRevenue, function (i, salesRevenue) {
                        let td = `<td class="text-end">${salesRevenue}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${salesRevenue}%</td>`
                        }
                        $("#salesRevenueVa").append(td)
                    })
                    $.each(data.creditSalesRevenueTotal, function (i, creditSalesRevenueTotal) {
                        let td = `<td class="text-end">${creditSalesRevenueTotal}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${creditSalesRevenueTotal}%</td>`
                        }
                        $("#creditSalesRevenueTotalVa").append(td)
                    })
                    $.each(data.salesCost, function (i, salesCost) {
                        let td = `<td class="text-end">${salesCost}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${salesCost}%</td>`
                        }
                        $("#salesCostVa").append(td)
                    })
                    $.each(data.grossProfitMinusLoss, function (i, grossProfitMinusLoss) {
                        let td = `<td class="text-end">${grossProfitMinusLoss}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${grossProfitMinusLoss}%</td>`
                        }
                        $("#grossProfitMinusLossVa").append(td)
                    })
                    $.each(data.bioAssetsProfitLoss, function (i, bioAssetsProfitLoss) {
                        let td = `<td class="text-end">${bioAssetsProfitLoss}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${bioAssetsProfitLoss}%</td>`
                        }
                        $("#bioAssetsProfitLossVa").append(td)
                    })
                    $.each(data.marketingExpenses, function (i, marketingExpenses) {
                        let td = `<td class="text-end">${marketingExpenses}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${marketingExpenses}%</td>`
                        }
                        $("#marketingExpensesVa").append(td)
                    })
                    $.each(data.administrativeExpenses, function (i, administrativeExpenses) {
                        let td = `<td class="text-end">${administrativeExpenses}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${administrativeExpenses}%</td>`
                        }
                        $("#administrativeExpensesVa").append(td)
                    })
                    $.each(data.otherOperatingRevenue, function (i, otherOperatingRevenue) {
                        let td = `<td class="text-end">${otherOperatingRevenue}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${otherOperatingRevenue}%</td>`
                        }
                        $("#otherOperatingRevenueVa").append(td)
                    })
                    $.each(data.otherOperatingCharges, function (i, otherOperatingCharges) {
                        let td = `<td class="text-end">${otherOperatingCharges}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${otherOperatingCharges}%</td>`
                        }
                        $("#otherOperatingChargesVa").append(td)
                    })
                    $.each(data.earningsMinusLosses, function (i, earningsMinusLosses) {
                        let td = `<td class="text-end">${earningsMinusLosses}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${earningsMinusLosses}%</td>`
                        }
                        $("#earningsMinusLossesVa").append(td)
                    })
                    $.each(data.profitLossSubsidiaries, function (i, profitLossSubsidiaries) {
                        let td = `<td class="text-end">${profitLossSubsidiaries}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${profitLossSubsidiaries}%</td>`
                        }
                        $("#profitLossSubsidiariesVa").append(td)
                    })
                    $.each(data.profitLossAssociated, function (i, profitLossAssociated) {
                        let td = `<td class="text-end">${profitLossAssociated}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${profitLossAssociated}%</td>`
                        }
                        $("#profitLossAssociatedVa").append(td)
                    })
                    $.each(data.profitLossFinancialInvestments, function (i, profitLossFinancialInvestments) {
                        let td = `<td class="text-end">${profitLossFinancialInvestments}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${profitLossFinancialInvestments}%</td>`
                        }
                        $("#profitLossFinancialInvestmentsVa").append(td)
                    })
                    $.each(data.interestIncome, function (i, interestIncome) {
                        let td = `<td class="text-end">${interestIncome}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${interestIncome}%</td>`
                        }
                        $("#interestIncomeVa").append(td)
                    })
                    $.each(data.interestExpense, function (i, interestExpense) {
                        let td = `<td class="text-end">${interestExpense}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${interestExpense}%</td>`
                        }
                        $("#interestExpenseVa").append(td)
                    })
                    $.each(data.otherFinancialIncomeExpenses, function (i, otherFinancialIncomeExpenses) {
                        let td = `<td class="text-end">${otherFinancialIncomeExpenses}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${otherFinancialIncomeExpenses}%</td>`
                        }
                        $("#otherFinancialIncomeExpensesVa").append(td)
                    })
                    $.each(data.earningsMinusLossesBeforeIncomeExpenses, function (i, earningsMinusLossesBeforeIncomeExpenses) {
                        let td = `<td class="text-end">${earningsMinusLossesBeforeIncomeExpenses}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${earningsMinusLossesBeforeIncomeExpenses}%</td>`
                        }
                        $("#earningsMinusLossesBeforeIncomeExpensesVa").append(td)
                    })
                    $.each(data.incomeTaxExpense, function (i, incomeTaxExpense) {
                        let td = `<td class="text-end">${incomeTaxExpense}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${incomeTaxExpense}%</td>`
                        }
                        $("#incomeTaxExpenseVa").append(td)
                    })
                    $.each(data.financialYearEarningsMinusLosses, function (i, financialYearEarningsMinusLosses) {
                        let td = `<td class="text-end">${financialYearEarningsMinusLosses}</td>`
                        if (i === 1) {
                            td = `<td class="text-end">${financialYearEarningsMinusLosses}%</td>`
                        }
                        $("#financialYearEarningsMinusLossesVa").append(td)
                    })
                }
            })
        },
        error: function (data) {
            $("#error").removeClass("d-none").text(data.responseJSON.error)
        }
    });
}

