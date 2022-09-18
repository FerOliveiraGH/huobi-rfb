require('dotenv-safe').config();

const { compraVenda } = require("./src/compra_venda");
const { permuta } = require("./src/permuta");
const { saveRfbFile, getStarDate, getEndDate } = require("./src/utilities");


async function load() {
    let year = 2022;
    let month = 8;

    let dateStart = await getStarDate(year, month);
    let dateEnd = await getEndDate(year, month);

    let file = "";

    file += await compraVenda('ETH', dateStart, dateEnd);
    file += await compraVenda('BTC', dateStart, dateEnd);
    file += await compraVenda('BUSD', dateStart, dateEnd);
    file += await permuta('ETH', 'BUSD', dateStart, dateEnd)
    file += await permuta('BTC', 'BUSD', dateStart, dateEnd)

    await saveRfbFile(year, month, file);
}

if (require.main === module) {
    console.log('Process start.');
    console.log('Wait a moment...');

    load().then(() => {
        console.log('Process end.');
    });
}
