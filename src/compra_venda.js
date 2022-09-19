require('dotenv-safe').config();

const Exchange = require('exchange-exterior-rfb').default;
const { myTrades } = require('./api.js');
const { getStarDate, getEndDate } = require("./utilities");


async function compraVenda(fileJson) {
    const taxEx = new Exchange({
        exchange_name: 'Huobi', // Exchange Name
        exchange_country: 'CN', // Exchange Country
        exchange_url: 'https://www.huobi.com/' // Exchange URL
    });

    for (let element of fileJson) {
        let trade = {};
        let dateTrade = new Date(element.Time);
        let symbols = element.Pair.split("/");

        if (symbols[1] !== 'BRL') {
            continue;
        }

        let fee = element.Fee.split(symbols[0])
        fee = fee.length > 1 ? fee[0] : 0

        if (element.Side === 'Buy') {
            trade = {
                date: `${dateTrade.getDate()}/${dateTrade.getMonth()+1}/${dateTrade.getFullYear()}`,

                brl_value: element.Total,
                brl_fees: (element.Price * fee).toFixed(2),

                coin_symbol: symbols[0],
                coin_quantity: element.Amount,
            }

            await taxEx.addBuyOperation(trade);
        } else if (element.Side === 'Sell') {
            trade = {
                date: `${dateTrade.getDate()}/${dateTrade.getMonth()+1}/${dateTrade.getFullYear()}`,

                brl_value: element.Total,
                brl_fees: (element.Price * fee).toFixed(2),

                coin_symbol: symbols[0],
                coin_quantity: element.Amount,
            }

            await taxEx.addSellOperation(trade);
        }
    }

   return await taxEx.exportFile();
}

module.exports  = { compraVenda }
