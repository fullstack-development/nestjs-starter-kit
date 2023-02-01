const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname);
const dist = path.resolve(__dirname, 'dist');
const enginesDir = path.resolve(__dirname, '../libs/repository/node_modules/@prisma/engines');

if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist);
}

fs.copyFileSync(
    path.resolve(root, '../libs/repository/schema.prisma'),
    path.resolve(dist, 'schema.prisma'),
);

let engine = getEngine();
if (!engine) {
    throw `Cannot find engine for '${process.platform}'`;
}

const engineFile = path.resolve(enginesDir, engine);
fs.copyFileSync(engineFile, path.resolve(dist, engine));

function getEngine() {
    const libConfigFile = path.resolve(__dirname, '.prisma-lib');

    if (fs.existsSync(libConfigFile)) {
        return JSON.parse(fs.readFileSync(libConfigFile)).lib;
    }

    const files = fs.readdirSync(enginesDir);
    const findEngine = (regexp) =>
        files.find(
            (f) => !fs.statSync(path.resolve(enginesDir, f)).isDirectory() && regexp.test(f),
        );

    let engine = null;
    switch (process.platform) {
        case 'linux':
            engine = findEngine(new RegExp(/.*\.so\.node$/gi));
            break;
        case 'win32':
            engine = findEngine(new RegExp(/.*\.dll\.node$/gi));
            break;
    }

    if (engine !== null) {
        fs.writeFileSync(libConfigFile, JSON.stringify({ lib: engine }));
    }

    return engine;
}
