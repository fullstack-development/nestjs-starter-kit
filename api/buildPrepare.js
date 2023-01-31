const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname);
const dist = path.resolve(__dirname, 'dist');

if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist);
}

fs.copyFileSync(
    path.resolve(root, '../libs/repository/schema.prisma'),
    path.resolve(dist, 'schema.prisma'),
);

const enginesList = {
    win32: 'node_modules/@prisma/engines/query_engine-windows.dll.node',
    ubuntu: 'node_modules/@prisma/engines/libquery_engine-debian-openssl-3.0.x.so.node',
    linux: 'node_modules/@prisma/engines/libquery_engine-linux-musl-openssl-3.0.x.so.node',
};

let engine = getEngine();
if (!engine) {
    throw `Cannot find engine for '${process.platform}'`;
}

const engineFile = path.resolve(root, `../libs/repository/${engine}`);
fs.copyFileSync(engineFile, path.resolve(dist, path.basename(engineFile)));

function getEngine() {
    const libConfigFile = path.resolve(__dirname, '.prisma-lib');

    if (fs.existsSync(libConfigFile)) {
        return JSON.parse(fs.readFileSync(libConfigFile)).lib;
    }

    const platform = process.platform;
    let engine = enginesList[platform];
    if (platform === 'linux') {
        const lsb = execSync('lsb_release -a | grep Description').toString();
        if (new RegExp(/.*ubuntu.*/gi).test(lsb)) {
            engine = enginesList.ubuntu;
        }
    }

    fs.writeFileSync(libConfigFile, JSON.stringify({ lib: engine }));

    return engine;
}
