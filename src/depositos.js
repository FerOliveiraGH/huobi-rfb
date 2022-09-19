require('dotenv-safe').config();

const Exchange = require('exchange-exterior-rfb').default;


async function depositos(year = 2022, month = 8, fileJson = {}) {
    const taxEx = new Exchange({
        exchange_name: 'Huobi', // Exchange Name
        exchange_country: 'CN', // Exchange Country
        exchange_url: 'https://www.huobi.com/' // Exchange URL
    });

    for (let element of fileJson) {
        let deposit = {};
        let dateTrade = new Date(element.Time);

        deposit = {
            date: `${dateTrade.getDate()}/${dateTrade.getMonth()+1}/${dateTrade.getFullYear()}`,
            // brl_fees: element.fees,

            coin_symbol: element.coin,
            coin_quantity: element.amount,
        }

        await taxEx.addDepositOperation(deposit);
    }

   return await taxEx.exportFile();
}

module.exports  = { depositos }
