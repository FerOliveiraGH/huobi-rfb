require('dotenv-safe').config();

const Exchange = require('exchange-exterior-rfb').default;
const { myTrades } = require('./api.js');


async function compraVenda(symbol1 = 'ETH', symbol2 = 'BRL', dateStart = new Date(), dateEnd = new Date()) {
    const taxEx = new Exchange({
        exchange_name: 'Binance', // Exchange Name
        exchange_country: 'US', // Exchange CNPJ
        exchange_url: 'https://binance.com' // Exchange URL
    });

    let startDay = dateStart.getDate();
    let endDay = dateEnd.getDate();

    for (let i=startDay; i <= endDay; i++) {
        let dateTradesStart = new Date(dateStart.getFullYear(), dateStart.getMonth(), i, 0, 0, 0);
        let dateTradesEnd = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), i, 23, 59, 59);
        dateTradesStart = dateTradesStart.getTime();
        dateTradesEnd = dateTradesEnd.getTime();

        let pair = symbol1.toUpperCase()+symbol2.toUpperCase();

        let response = await myTrades(pair, dateTradesStart, dateTradesEnd);

        for (let element of response) {
            let trade = {};
            let dateTrade = new Date(element.time);

            if (element.isBuyer) {
                trade = {
                    date: `${dateTrade.getDate()}/${dateTrade.getMonth()+1}/${dateTrade.getFullYear()}`,

                    brl_value: element.quoteQty,
                    brl_fees: element.commission,

                    coin_symbol: symbol1,
                    coin_quantity: element.qty,
                }

                taxEx.addBuyOperation(trade);
            } else if (!element.isBuyer) {
                trade = {
                    date: `${dateTrade.getDate()}/${dateTrade.getMonth()+1}/${dateTrade.getFullYear()}`,

                    brl_value: element.quoteQty,
                    brl_fees: element.commission,

                    coin_symbol: symbol1,
                    coin_quantity: element.qty,
                }

                taxEx.addSellOperation(trade);
            }
        }
    }

   return taxEx.exportFile();
}

module.exports  = { compraVenda }
