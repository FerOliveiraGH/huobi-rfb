require('dotenv-safe').config();

const Exchange = require('exchange-exterior-rfb').default;
const { myTrades } = require('./api.js');
const { getStarDate, getEndDate } = require("./utilities");


async function compraVenda(symbol = 'ETH', year = 2022, month = 8) {
    const taxEx = new Exchange({
        exchange_name: 'Binance', // Exchange Name
        exchange_country: 'US', // Exchange CNPJ
        exchange_url: 'https://binance.com' // Exchange URL
    });

    let dateStart = await getStarDate(year, month);
    let dateEnd = await getEndDate(year, month);

    let startDay = dateStart.getDate();
    let endDay = dateEnd.getDate();
    let symbol2 = 'BRL'

    for (let i=startDay; i <= endDay; i++) {
        let dateTradesStart = new Date(dateStart.getFullYear(), dateStart.getMonth(), i, 0, 0, 0);
        let dateTradesEnd = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), i, 23, 59, 59);
        dateTradesStart = dateTradesStart.getTime();
        dateTradesEnd = dateTradesEnd.getTime();

        let pair = symbol.toUpperCase()+symbol2.toUpperCase();

        let response = await myTrades(pair, dateTradesStart, dateTradesEnd);

        for (let element of response) {
            let trade = {};
            let dateTrade = new Date(element.time);

            if (element.isBuyer) {
                trade = {
                    date: `${dateTrade.getDate()}/${dateTrade.getMonth()+1}/${dateTrade.getFullYear()}`,

                    brl_value: element.quoteQty,
                    brl_fees: element.commission,

                    coin_symbol: symbol,
                    coin_quantity: element.qty,
                }

                await taxEx.addBuyOperation(trade);
            } else if (!element.isBuyer) {
                trade = {
                    date: `${dateTrade.getDate()}/${dateTrade.getMonth()+1}/${dateTrade.getFullYear()}`,

                    brl_value: element.quoteQty,
                    brl_fees: element.commission,

                    coin_symbol: symbol,
                    coin_quantity: element.qty,
                }

                await taxEx.addSellOperation(trade);
            }
        }
    }

   return await taxEx.exportFile();
}

module.exports  = { compraVenda }
