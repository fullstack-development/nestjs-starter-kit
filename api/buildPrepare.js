const fs = require('fs');
const path = require('path');

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
    linux: 'node_modules/@prisma/engines/libquery_engine-linux-musl-openssl-3.0.x.so.node',
};

const platform = process.platform;
const engine = enginesList[platform];

if (!engine) {
    throw `Cannot find engine for '${platform}'`;
}

const engineFile = path.resolve(root, `../libs/repository/${engine}`);
fs.copyFileSync(engineFile, path.resolve(dist, path.basename(engineFile)));
