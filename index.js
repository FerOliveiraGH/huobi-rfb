require('dotenv-safe').config();

const { depositos } = require("./src/depositos");
const { saques } = require("./src/saques");
const { compraVenda } = require("./src/compra_venda");
const { permuta } = require("./src/permuta");
const { saveRfbFile } = require("./src/utilities");
const fs = require("fs/promises");
const csv = require('csvtojson');


async function load() {
    let year = 2022;
    let month = 8;
    let inputFile = 'TransactionHistory-20220919.csv';

    let fileJson = await csv().fromFile(inputFile);

    let file = '';
    file += await compraVenda(fileJson);
    file += await permuta(fileJson);
    // file += await depositos(year, month, fileJson);
    // file += await saques(year, month);
    // file += await compraVenda('BTC', year, month);
    // file += await compraVenda('BUSD', year, month);
    // file += await permuta('BTC', 'BUSD', year, month)

    await saveRfbFile(year, month, file);
}

if (require.main === module) {
    console.log('Process start.');
    console.log('Wait a moment...');

    load().then(() => {
        console.log('Process end.');
    });
}
