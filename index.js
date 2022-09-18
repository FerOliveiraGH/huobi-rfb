require('dotenv-safe').config();

const { compraVenda } = require("./src/compra_venda");
const { permuta } = require("./src/permuta");
const { depositos } = require("./src/depositos");
const { saveRfbFile } = require("./src/utilities");


async function load() {
    let year = 2022;
    let month = 8;

    let file = "";

    // file += depositos('ETH', year, month);

    file += await compraVenda('ETH', year, month);
    file += await compraVenda('BTC', year, month);
    file += await compraVenda('BUSD', year, month);
    file += await permuta('ETH', 'BUSD', year, month)
    file += await permuta('BTC', 'BUSD', year, month)

    await saveRfbFile(year, month, file);
}

if (require.main === module) {
    console.log('Process start.');
    console.log('Wait a moment...');

    load().then(() => {
        console.log('Process end.');
    });
}
