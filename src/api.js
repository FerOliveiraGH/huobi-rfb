const CryptoJS = require('crypto-js');
const Promise = require('bluebird');
const moment = require('moment');
const HmacSHA256 = require('crypto-js/hmac-sha256')
const url = require('url');
const crypto = require("crypto");
const queryString = require("querystring");
const axios = require('axios');

const api_url = process.env.API_URL;
const access_key = process.env.ACCESS_KEY;
const secret_key = process.env.SECRET_KEY;
const account_id_pro = process.env.ACCOUNT_ID_PRO;
const trade_password = process.env.TRADE_PASSWORD;

const HOST = url.parse(api_url).host;

let errors = 0;

const DEFAULT_HEADERS = {
    "Content-Type": "application/json",
    // "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36"
}

async function myTrades(symbol, startTime, endTime, limit = 500) {
    const data = {
        'account-id': 52376454
    };

    // if (symbol) data.symbol = symbol.toLowerCase();
    // data.states = 'filled';
    // data.from = '599731577524395';
    if (startTime) data["start-time"] = startTime;
    data["transact-type"] = 'trade';
    // if (endTime) data["end-time"] = endTime;
    // if (limit) data.size = limit;

    // return await privateCall('/v1/order/orders', data);
    // return await privateCall('/v1/order/history', data);
    return await privateCall('/v1/account/history', data);
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

function get_auth() {
    let sign = trade_password + 'hello, moto';
    let md5 = CryptoJS.MD5(sign).toString().toLowerCase();
    return encodeURIComponent(JSON.stringify({
        assetPwd: md5
    }));
}

function sign_sha(method, baseurl, path, data) {
    let pars = [];
    for (let item in data) {
        pars.push(item + "=" + encodeURIComponent(data[item]));
    }
    let p = pars.sort().join("&");
    let meta = [method, baseurl, path, p].join('\n');
    // console.log(meta);
    let hash = HmacSHA256(meta, secret_key);
    let Signature = encodeURIComponent(CryptoJS.enc.Base64.stringify(hash));
    // console.log(`Signature: ${Signature}`);
    p += `&Signature=${Signature}`;
    // console.log(p);
    return p;
}

function get_body() {
    return {
        AccessKeyId: access_key,
        SignatureMethod: "HmacSHA256",
        SignatureVersion: 2,
        Timestamp: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
    };
}

function getCurrentDateUTC() {
    let date = new Date();

    return (
        [
            date.getUTCFullYear(),
            padTo2Digits(date.getUTCMonth() + 1),
            padTo2Digits(date.getUTCDate()),
        ].join('-') +
        'T' +
        [
            padTo2Digits(date.getUTCHours()),
            padTo2Digits(date.getUTCMinutes()),
            padTo2Digits(date.getUTCSeconds()),
        ].join(':')
    );
}

function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}

async function privateCall(path, data = {}, method = 'GET') {
    if (!access_key || !secret_key)
        throw new Error('Preencha corretamente sua API KEY e SECRET KEY');

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    await delay(200);

    let AccessKeyId = access_key;
    let SignatureMethod='HmacSHA256';
    let SignatureVersion = 2;
    // let Timestamp = moment.utc().utcOffset('+0005').format('YYYY-MM-DDTHH:mm:ss');
    // let Timestamp = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
    let Timestamp = getCurrentDateUTC();

    const newData = { AccessKeyId, SignatureMethod, SignatureVersion, Timestamp, ...data };
    const qs = `${queryString.stringify(newData)}`;

    let meta = `GET\n${HOST}\n${path}\n${qs}`;
    let hash = HmacSHA256(meta, secret_key);
    let Signature = CryptoJS.enc.Base64.stringify(hash);

    try {
        const result = await axios({
            method,
            url: `${api_url}${path}?${qs}&Signature=${Signature}`,
            headers: DEFAULT_HEADERS,
        });

        let body = result.data;

        if (body.status === 'error') {
            errors++;
            if (errors > 10) {
                throw Error('Request Error');
            }
            return await privateCall(path, data, method);
        }

        errors = 0;
        return JSON.parse(JSON.stringify(body.data));
    } catch (error) {
        console.log(error)
    }
}

function call_api(method, path, payload, body) {
    return new Promise(resolve => {
        let url = `${URL}${path}?${payload}`;
        // console.log(url);
        let headers = DEFAULT_HEADERS;
        headers.AuthData = get_auth();

        if (method === 'GET') {
            http.get(url, {
                timeout: 1000,
                headers: headers
            }).then(data => {
                let json = JSON.parse(data);
                if (json.status === 'ok') {
                    // console.log(json.data);
                    resolve(json.data);
                } else {
                    // console.log('调用错误', json);
                    resolve(null);
                }
            }).catch(ex => {
                // console.log(method, path, '异常', ex);
                resolve(null);
            });
        } else if (method === 'POST') {
            http.post(url, body, {
                timeout: 1000,
                headers: headers
            }).then(data => {
                let json = JSON.parse(data);
                if (json.status === 'ok') {
                    // console.log(json.data);
                    resolve(json.data);
                } else {
                    // console.log('调用错误', json);
                    resolve(null);
                }
            }).catch(ex => {
                // console.log(method, path, '异常', ex);
                resolve(null);
            });
        }
    });
}

let HUOBI_PRO = {
    get_account: function() {
        let path = `/v1/account/accounts`;
        let body = get_body();
        let payload = sign_sha('GET', HOST, path, body);
        return call_api('GET', path, payload, body);
    },
    get_account_history: function() {
        let path = `/v1/account/history`;
        let body = get_body();
        let payload = sign_sha('GET', HOST, path, body);
        return call_api('GET', path, payload, body);
    },
    get_balance: function() {
        let path = `/v1/account/accounts/${account_id_pro}/balance`;
        let body = get_body();
        let payload = sign_sha('GET', HOST, path, body);
        return call_api('GET', path, payload, body);
    },
    get_open_orders: function(symbol) {
        let path = `/v1/order/orders`;
        let body = get_body();
        body.symbol = symbol;
        body.states = 'submitted,partial-filled';
        let payload = sign_sha('GET', HOST, path, body);
        return call_api('GET', path, payload, body);
    },
    get_order: function(order_id) {
        let path = `/v1/order/orders/${order_id}`;
        let body = get_body();
        let payload = sign_sha('GET', HOST, path, body);
        return call_api('GET', path, payload, body);
    },
}

module.exports = { myTrades, myDeposits, myWithdraw }