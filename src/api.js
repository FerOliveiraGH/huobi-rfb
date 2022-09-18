const axios = require('axios');
const queryString = require('querystring');
const crypto = require('crypto');
const apiKey = process.env.API_KEY;
const apiSecret = process.env.SECRET_KEY;
const apiUrl = process.env.API_URL;


async function myTrades(symbol, startTime, endTime, limit = null) {
    const data = {};

    if (symbol) data.symbol = symbol;
    if (startTime) data.startTime = startTime;
    if (endTime) data.endTime = endTime;
    if (limit) data.limit = limit;

    return await privateCall('/api/v3/myTrades', data);
}

async function myDeposits(startTime, endTime, limit = null) {
    const data = {};

    if (startTime) data.startTime = startTime;
    if (endTime) data.endTime = endTime;
    if (limit) data.limit = limit;

    return await privateCall('/sapi/v1/capital/deposit/hisrec', data);
}

async function myWithdraw(startTime, endTime, limit = null) {
    const data = {};

    if (startTime) data.startTime = startTime;
    if (endTime) data.endTime = endTime;
    if (limit) data.limit = limit;

    return await privateCall('/sapi/v1/capital/withdraw/history', data);
}

async function privateCall(path, data = {}, method = 'GET') {
    if (!apiKey || !apiSecret)
        throw new Error('Preencha corretamente sua API KEY e SECRET KEY');

    const timestamp = Date.now();
    const recvWindow = 60000;//máximo permitido, default 5000

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    await delay(200);

    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(`${queryString.stringify({ ...data, timestamp, recvWindow })}`)
        .digest('hex');

    const newData = { ...data, timestamp, recvWindow, signature };
    const qs = `?${queryString.stringify(newData)}`;

    try {
        const result = await axios({
            method,
            url: `${apiUrl}${path}${qs}`,
            headers: { 'X-MBX-APIKEY': apiKey }
        });

        return result.data;
    } catch (error) {
        console.log(error)
    }
}

module.exports = { myTrades, myDeposits, myWithdraw }