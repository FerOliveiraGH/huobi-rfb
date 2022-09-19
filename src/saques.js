require('dotenv-safe').config();

const Exchange = require('exchange-exterior-rfb').default;
const { myWithdraw } = require('./api.js');
const { getStarDate, getEndDate } = require("./utilities");


async function saques(year = 2022, month = 8) {
    const taxEx = new Exchange({
        exchange_name: 'Huobi', // Exchange Name
        exchange_country: 'CN', // Exchange Country
        exchange_url: 'https://www.huobi.com/' // Exchange URL
    });

    let dateStart = await getStarDate(year, month);
    let dateEnd = await getEndDate(year, month);

    let startDay = dateStart.getDate();
    let endDay = dateEnd.getDate();

    for (let i=startDay; i <= endDay; i++) {
        let dateTradesStart = new Date(dateStart.getFullYear(), dateStart.getMonth(), i, 0, 0, 0);
        let dateTradesEnd = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), i, 23, 59, 59);
        dateTradesStart = dateTradesStart.getTime();
        dateTradesEnd = dateTradesEnd.getTime();

        let response = await myWithdraw(dateTradesStart, dateTradesEnd);

        for (let element of response) {
            let withdraw = {};
            let dateTrade = new Date(element.insertTime);

            withdraw = {
                date: `${dateTrade.getDate()}/${dateTrade.getMonth()+1}/${dateTrade.getFullYear()}`,
                // brl_fees: element.fees,

                coin_symbol: element.coin,
                coin_quantity: element.amount,
            }

            await taxEx.addWithdrawOperation(withdraw);
        }
    }

   return await taxEx.exportFile();
}

module.exports  = { saques }
