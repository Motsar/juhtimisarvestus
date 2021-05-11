$(document).ready(function () {

    var pageURL = $(location).attr("href")
    let url = new URL(pageURL)
    if (url.pathname === "/raport") {
        let urlParams = new URLSearchParams(window.location.search);
        let companyId = urlParams.get('dokument');
        let schemaType = $("#schemaType").text().split(" ")
        if (schemaType[1] === "2") {
            $('#schema1Ha,#schema1Va,.profitReportForm #schema1').remove()
        } else {
            $('#schema2Ha,#schema2Va,.profitReportForm #schema2').remove()
        }
        reportResultClone = $('#reportsDataForChange').clone();
        $('#kasumiAruandeModal,#balanceModal,#breakEvenModal').attr('data-compid', companyId)
        getReportResults(companyId)
        getBreakEvenData(companyId);
        getProfitReportData(companyId);
        getBalanceData(companyId)
    }

    //Allow change data

    $('.modal-footer').on('click', '.changeData', function (e) {
        e.preventDefault();
        let modal = $(this).closest('.modal');
        modal.find('.alert').addClass('d-none');
        modal.find('table tbody input, .modal-body button').prop("disabled", false);
        modal.find('.delRow , .delCol').removeClass('d-none')
        modal.find('#breakEvenMess').text('')
        modal.find('.modal-footer').prepend('<button type="submit" class="btn btn-primary salvesta">SALVESTA</button>')
        $(this).remove();
    })

    //Allows to change company data

    $('#reportResultsView').on('click', '.changeCompData', function (e) {
        e.preventDefault();
        let thisCard = $(this).closest('.card')
        $('.reportResultsContainer #reportResultsView .card .alert-success').addClass('d-none').text("")
        thisCard.find('input,textarea').prop("disabled", false)
        let thisDiv = $(this).closest('div')
        thisDiv.prepend('<button type="submit" class="btn btn-primary salvesta">SALVESTA</button>')
        $(this).remove();
    })

    //Directs to selected report result page

    $(".clickable-row").click(function () {
        window.location = "/raport?dokument=" + $(this).data("href");
    });

    //Direct back to reports

    $("#returReport").click(function () {
        window.location = "/raportid";
    });

    //Direct to settings

    $("#settings").click(function () {
        window.location = "/seaded";
    });

    //current user account delete

    $('#deleteAccount').on("submit",function(e){
        e.preventDefault();
        if(!$(this).find("#confirmDelete").prop('checked')){
            $('#confirmDelete').addClass('is-invalid')
        }

        let userId = $(this).find("button").attr("data-user-id")

        let reqBody={ user_id : userId }

        $.ajax({
            url: "/users",
            type: 'DELETE',
            dataType: "json",
            data: reqBody,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                console.log(data)
                $("#currentUser").removeClass("d-none").text(data.message)
                setTimeout(function() {
                    window.location = "/logout";
                   }, 3000);
            },
            error: function (data) {
                console.log(data)
            }
        });
    })


    //Add admin

    $("#addAdmin").on("submit",function(e){
        e.preventDefault();
            $(this).find(".alert").addClass("d-none")
            let newAdminEmail=$("#neweAdminEmail").val();
            let reqBody = {type:2, email:newAdminEmail}
            $.ajax({
                url: "/users",
                type: 'PATCH',
                dataType: "json",
                data: reqBody,
                xhrFields: {
                    withCredentials: true
                },
                success: function (data) {
                    console.log(data)
                    $("#adminAddAlert").removeClass("d-none").text(data.message);
                },
                error: function (data) {
                    console.log(data)
                }
            });
    })

    //change pass

    $("#changePass").on("submit",function(e){
        $(this).find(".alert").addClass("d-none")
        e.preventDefault();
        $(this).find("input").removeClass("is-invalid")
        $(".invalidPassword").text("")
        let pass1 = $("#password1").val()
        let pass2 = $("#password2").val()
        if(pass1!==pass2){
            $("#password2").addClass("is-invalid")
            $(".invalidPassword").text("Paroolid ei ole samaväärsed!")
        }else if(!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/.test(pass1)){
            $(this).find("input").addClass("is-invalid")
            $(".invalidPassword").text("Parool peab olema vähemalt 8 tähmärki pikk, sisaldama suuri ja väikseid tähti ning sisaldama ühte tähemärki!")
        }else{
            
            let reqBody = {type:1,password:pass1}
            $.ajax({
                url: "/users",
                type: 'PATCH',
                dataType: "json",
                data: reqBody,
                xhrFields: {
                    withCredentials: true
                },
                success: function (data) {
                    console.log(data)
                    $(this).find("input").addClass("is-valid");
                    $("#passChange").removeClass("d-none").text(data.message);
                    $("#password1").val("")
                    $("#password2").val("")
                },
                error: function (data) {
                    console.log(data)
                }
            });
        }
    })


    //Admin user delete

    $('.delUser').on("click",function(e){
        e.preventDefault();

        let userId = $(this).attr("data-user-id")
        let thisRow = $(this).closest('tr')
        let reqBody={ user_id : userId }
        

        $.ajax({
            url: "/users",
            type: 'DELETE',
            dataType: "json",
            data: reqBody,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                console.log(data)
                $("#usersTableAlert").removeClass("d-none").text(data.message)
                thisRow.remove();
            },
            error: function (data) {
                console.log(data)
            }
        });

    })

    //Add remove columns table handling

    $('.newProfitCol').on('click', function () {
        let thisFormTable = $(this).parent().find('form table');
        addColumn(thisFormTable)
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
        addRows(table);
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

    //Aruande kustutamine

    $('#delRaport').click(function () {
        let card = $(this).closest(".card");
        let id = card.attr("data-comp-id")
        let compObj = { "company_id": id }
        $.ajax({
            url: "/companies",
            type: 'DELETE',
            dataType: 'json',
            accept: 'json',
            data: compObj,
            traditional: true,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                console.log(data)
                window.location.replace("/raportid")
            },
            error: function (data) {
                let alert = $("#reportResultsView .card .alert");
                alert.addClass("alert-danger").removeClass("d-none").text(data.responseJSON.error)
            }
        });
    })

    //Update company data to backend

    $('#reportResultsView .card').on("click", ".salvesta", function () {
        let thisDiv = $(this).closest('div');
        let compdata = {
            _id: "" + $('.card').attr('data-comp-id'),
            compName: $('#compName').val(),
            regNum: $('#regNum').val(),
            address: $('#adress').val(),
            comp_email: $('#comp_email').val(),
            phone: $('#phone').val(),
            additional_info: $('#additional_info').val()
        }
        let fields = $(this).closest('.card').find('input, textarea');
        $.ajax({
            url: "/companies",
            type: 'PATCH',
            dataType: "json",
            data: compdata,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                $('#compName').removeClass('is-invalid')
                $('#reportResultsView .card .alert-success').removeClass('d-none').text(data.success)
                $('.card .salvesta').remove();
                thisDiv.prepend('<button type="submit" class="btn btn-primary changeCompData">MUUDA</button>');
                fields.prop("disabled", true);
                $('#reportHead').text(compdata.compName);
            },
            error: function (data) {
                console.log(data.responseJSON)
                    $('#reportResultsView #compDataErr').text(data.responseJSON.error)
                    $('#reportResultsView #compName').addClass('is-invalid')
            }
        });
    })

    $("#tasuvuspunkt").on("click", function () {
        if ($("#breakEvenModal .modal-footer button").hasClass(".changeData")) {
            $("#breakEvenModal").find('.delRow').addClass('d-none')
        }
    })

    //Send company data to backend

    $('#compData').submit((event) => {
        event.preventDefault();
        let vatObl;
        if ($('#vat_obligatory:checked').val() !== "yes") {
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
        $.ajax({
            url: "/companies",
            type: 'POST',
            dataType: "json",
            data: compdata,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                $('#compName').removeClass('is-invalid')
                $("#compData input,#compData textarea,#compData button").prop("disabled", true);
                $('#compData .alert-success').removeClass('d-none').text(data.success)
                $('#kasumiaruanne, #bilanss ,#tasuvuspunkt').prop('disabled', false);
                $('#kasumiaruanne, #bilanss ,#tasuvuspunkt').removeClass('disabled');
                let compID = data._id;
                $('#kasumiAruandeModal,#balanceModal,#breakEvenModal').attr('data-compid', compID)
                if (data.vat_obligatory === "no") { $('.creditSalesRevenue0,.creditSalesRevenue9,.creditSalesRevenue20').addClass('d-none') }
                if (data.Profit_report_schema === 1) {
                    $('#schema2').remove();
                } else {
                    $('#schema1').remove();
                }
            },
            error: function (data) {
                console.log(data.responseJSON)
                if (data.status === 401) {
                    $('#compDataErr').text(data.responseJSON.error)
                    $('#compName').addClass('is-invalid')
                }
            }
        });
    })

    //Send profitreports data to backend

    $('#kasumiAruandeModal').on("click", ".salvesta", function (e) {
        e.preventDefault();
        let thisModal = $(this).closest('.modal')
        thisModal.find('.alert').removeClass('alert-danger , alert-success')
        thisModal.find('.alert').addClass('d-none');
        let saveBtn = $(this)
        let companyID = '' + thisModal.attr('data-compid');
        let tableBodyRow = thisModal.find('table tbody tr');
        let tblRowLen = tableBodyRow.first().find('td').length;
        let dataObj = {
            "company_id": companyID,
            "years": []
        }
        for (let i = 0; i < tblRowLen; i++) {
            let thisProfitReportObj = {};
            for (let e = 0; e < tableBodyRow.length; e++) {
                let thisRowTd = tableBodyRow.eq(e).find('td').eq(i)
                let tdKey = thisRowTd.find('input').attr('name')
                let tdValue;
                if (thisRowTd.find('input').val() === '') {
                    tdValue = 0;
                    thisRowTd.find('input').val(tdValue)
                } else {
                    tdValue = thisRowTd.find('input').val();
                }
                thisProfitReportObj[tdKey] = parseFloat(tdValue);
            }
            dataObj.years.push(JSON.stringify(thisProfitReportObj))
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
                if (url.pathname === "/raport") {
                    $('#reportsDataForChange').replaceWith(reportResultClone.clone());
                    getReportResults(companyID)
                }
            },
            error: function (data) {
                let vastus = data.responseJSON.error
                thisModal.find('.alert').removeClass('d-none')
                thisModal.find('.alert').addClass('alert-danger').text(vastus)
            }
        });
    })

    //Send balance data to backend

    $('#balanceModal').on('click', '.salvesta', function (e) {
        e.preventDefault();
        let thisModal = $(this).closest('.modal')
        thisModal.find('.alert').removeClass('alert-danger , alert-success')
        thisModal.find('.alert').addClass('d-none');
        let saveBtn = $(this)
        let companyID = '' + thisModal.attr('data-compid');
        let tableBodyRow = thisModal.find('table tbody tr');
        let tblRowLen = tableBodyRow.first().find('td').length;
        let dataObj = {
            "company_id": companyID,
            "dates": []
        }

        for (let i = 0; i < tblRowLen; i++) {
            let thisBalanceObj = {};
            for (let e = 0; e < tableBodyRow.length; e++) {
                let thisRowTd = tableBodyRow.eq(e).find('td').eq(i)
                let tdKey = thisRowTd.find('input').attr('name')
                let tdValue;
                if (thisRowTd.find('input').val() === '' && tdKey !== 'date') {
                    tdValue = 0;
                    thisRowTd.find('input').val(tdValue)
                } else if (tdKey === 'date') {
                    let date = thisRowTd.find('.date').val().split("-")
                    tdValue = "" + date[0].toString() + date[1].toString() + date[2].toString() + ""
                } else {
                    tdValue = thisRowTd.find('input').val();
                }
                thisBalanceObj[tdKey] = parseFloat(tdValue);
            }
            dataObj.dates.push(JSON.stringify(thisBalanceObj))
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
                thisModal.find('.alert').removeClass('d-none').text(data.success)
                thisModal.find('.alert').addClass('alert-success')
                changeSave(saveBtn)
                if (url.pathname === "/raport") {
                    $('#reportsDataForChange').replaceWith(reportResultClone.clone());
                    getReportResults(companyID)
                }
            },
            error: function (data) {
                let vastus = data.responseJSON.error
                thisModal.find('.alert').removeClass('d-none')
                thisModal.find('.alert').addClass('alert-danger').text(vastus)

            }
        });
    })

    //Send breakevenpoint graphics data to backend

    $('#breakEvenModal').on("click", ".salvesta", function (e) {
        e.preventDefault();
        let thisModal = $(this).closest('.modal')
        thisModal.find('.alert').removeClass('alert-danger , alert-success')
        thisModal.find('.alert').addClass('d-none');
        let saveBtn = $(this)
        let rows = thisModal.find('tbody tr');
        let companyID = '' + thisModal.attr('data-compid');

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
            }
            if (rows.eq(i).find('.expenses').val() === '') {
                expens = 0;
                rows.eq(i).find('.expenses').val(0)
            } else {
                expens = parseFloat(rows.eq(i).find('.expenses').val())
            }
            breakEvenObj.salesTurnover.push(salesT)
            breakEvenObj.expenses.push(expens)
        }

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
                if (url.pathname === "/raport") {
                    //Break even point analysis
                    $("#breakEvenPointTable").replaceWith(breakEvenResTable.clone())
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
                        }
                        ,
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
                    let salesTurnoverArr = breakEvenObj.salesTurnover
                    let expensesArr = breakEvenObj.expenses

                    for (let i = 0; i < salesTurnoverArr.length; i++) {
                        breakEvenPointSalesTurnOver.push(salesTurnoverArr[i])
                        breakEvenPointExpenses.push(expensesArr[i])
                        breakEvenPointMonths.push('Kuu ' + e);
                        profitData.push(salesTurnoverArr[i] - expensesArr[i])
                        $('#breakEvenPointTable thead tr').append(`<th class="text-end">Kuu ${e}</th>`)
                        $('#salesTurnover').append(`<td class="text-end">${salesTurnoverArr[i]}</td>`)
                        $('#expenses').append(`<td class="text-end">${expensesArr[i]}</td>`)
                        $('#profit').append(`<td class="text-end">${salesTurnoverArr[i] - expensesArr[i]}</td>`)
                        e += 1;
                    }

                    let salesTurnoverTotal = totalSum(salesTurnoverArr);
                    let expensesTotal = totalSum(expensesArr);
                    let profitTotal = totalSum(profitData);

                    $('#breakEvenPointTable thead tr').append(`<th class="text-end">Total</th>`)
                    $('#salesTurnover').append(`<td class="text-end">${salesTurnoverTotal}</td>`)
                    $('#expenses').append(`<td class="text-end">${expensesTotal}</td>`)
                    $('#profit').append(`<td class="text-end">${profitTotal}</td>`)
                    removeData(BreakEvenChart)
                    addData(BreakEvenChart, chartData.data.labels, [chartData.data.datasets[0].data, chartData.data.datasets[1].data])
                }
                changeSave(saveBtn);
            },
            error: function (data) {
                let vastus = data.responseJSON.error
                thisModal.find('.alert').removeClass('d-none')
                thisModal.find('.alert').addClass('alert-danger').text(vastus)
            }
        });
    })
})