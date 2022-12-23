const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname);
const dist = path.resolve(__dirname, 'dist');

if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist);
}

fs.copyFileSync(
    path.resolve(root, '../modules/repository/schema.prisma'),
    path.resolve(dist, 'schema.prisma'),
);

const enginesList = {
    win32: 'node_modules/@prisma/engines/query_engine-windows.dll.node',
};

const engine = enginesList[process.platform];
if (engine) {
    const file = path.resolve(root, `../modules/repository/${engine}`);
    fs.copyFileSync(file, path.resolve(dist, path.basename(file)));
}
