const {
    NetWorkingCapital,
    CurrentRatio,
    QuickRatio,
    CashRatio,
    totalAssetTurnover,
    daysAssetsHold
    } = require('../middlewares');

const {netWorkingCapitalRes,currentRatioRes,quickRatioRes,cashRatioRes, totalAssetTurnoverRes,daysAssetsHoldRes}= require('../testData/calculationResults')


const {yearLength,balances, profitReports} = require('../testData/testData')

    describe("Backend analysis calculations",()=>{



        describe("ratio calculations", ()=>{

            describe("Net Working capital", ()=> {
                it("should equal to Net Working capital calculations results", () => {
                    expect(NetWorkingCapital(balances)[0].netWorkingCapital).toEqual(netWorkingCapitalRes[0].result);
                })
            })

            describe("Current Ratio", ()=> {
                it("should equal to CurrentRatio calculations results", () => {
                    expect(CurrentRatio(balances)[0].currentRatio).toEqual(currentRatioRes[0].result);
                })

            })

            describe("Quick Ratio", ()=> {
                it("should equal to QuickRatio calculations results", () => {
                    expect(QuickRatio(balances)[0].quickRatio).toEqual(quickRatioRes[0].result);
                })
            })

            describe("Cash Ratio", ()=> {
                it("should equal to CashRatio calculations results", () => {
                    expect(CashRatio(balances)[0].cashRatio).toEqual(cashRatioRes[0].result);
                })
            })

            describe("total Asset Turnover", ()=> {
                it("should equal to total asset turnover calculations results", () => {
                    expect(totalAssetTurnover(balances, profitReports)[0].totalAssetTurnover).toEqual(totalAssetTurnoverRes[0].result);
                })
            })
            console.log(totalAssetTurnover(balances, profitReports))

            describe("days Assets Turnover", ()=> {
                it("should equal to days Assets Turnover calculations results", () => {
                    expect(daysAssetsHold(totalAssetTurnover(balances, profitReports), yearLength)[0].DaysAssetsHold).toEqual(daysAssetsHoldRes[0].result);
                })
            })

        })
    })
    