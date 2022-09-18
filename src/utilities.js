const fsPromises = require("fs/promises");
const fs = require("fs");


async function saveRfbFile(year, month, data) {
    try {
        let name = await getNameFile(year, month);
        let folder = 'rfbs';
        if (!fs.existsSync(folder)){
            await fsPromises.mkdir(folder);
        }
        await fsPromises.writeFile(`${folder}/${name}.rfb`, data)
    } catch (err) {
        console.log(err);
    }
}

async function getStarDate(year, month) {
    return new Date(year, month-1, 1, 0, 0, 0);
}

async function getEndDate(year, month) {
    return new Date(year, month, -1, 23, 59, 59)
}

async function getNameFile(year, month) {
    return `${year}-${month}-${(new Date()).getTime()}`;
}

module.exports = { saveRfbFile, getStarDate, getEndDate };
