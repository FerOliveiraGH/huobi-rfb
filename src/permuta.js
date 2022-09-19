require('dotenv-safe').config();

const Exchange = require('exchange-exterior-rfb').default;


async function permuta(inputFile) {
    const taxEx = new Exchange({
        exchange_name: 'Huobi', // Exchange Name
        exchange_country: 'CN', // Exchange Country
        exchange_url: 'https://www.huobi.com/' // Exchange URL
    });

    for (let element of inputFile) {
        let trade = {};
        let dateTrade = new Date(element.Time);
        let symbols = element.Pair.split("/");

        if (symbols[1] === 'BRL') {
            continue;
        }

        if (element.Side === 'Buy') {
            trade = {
                date: `${dateTrade.getDate()}/${dateTrade.getMonth()+1}/${dateTrade.getFullYear()}`,
                //brl_fees: '00', // Fees is optional

                received_coin_symbol: symbols[0],
                received_coin_quantity: element.Amount,

                delivered_coin_symbol: symbols[1],
                delivered_coin_quantity: element.Total,
            }

            await taxEx.addPermutationOperation(trade);
        } else if (element.Side === 'Sell') {
            trade = {
                date: `${dateTrade.getDate()}/${dateTrade.getMonth()+1}/${dateTrade.getFullYear()}`,
                //brl_fees: '00', // Fees is optional

                received_coin_symbol: symbols[1],
                received_coin_quantity: element.Total,

                delivered_coin_symbol: symbols[0],
                delivered_coin_quantity: element.Amount,
            }

            await taxEx.addPermutationOperation(trade);
        }
    }

    return await taxEx.exportFile();
}

module.exports = { permuta }