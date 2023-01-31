const { resolve } = require('path');
const fs = require('fs');

const toBase64 = (data) => {
    if (data instanceof Buffer) {
        return data.toString('base64');
    }
    if (typeof data === 'string') {
        return Buffer.from(data).toString('base64');
    }
    throw 'Unknown type of data';
};

const readFile = (folder, file) => {
    return toBase64(fs.readFileSync(resolve(__dirname, 'text', folder, file)));
};

const method = (file) => {
    return readFile('methods', file);
};

const entity = (file) => {
    return readFile('entities', file);
};

const guard = (file) => {
    return readFile('guards', file);
};

module.exports = {
    getText() {
        return {
            description: readFile('.', 'description.md'),
            methods: {
                api: {
                    echo: method('api/echo.md'),
                },
                'api/auth': {
                    'sign-up': method('api/auth/sign-up.md'),
                    'sign-in': method('api/auth/sign-in.md'),
                    'confirm-email': method('api/auth/confirm-email.md'),
                    refresh: method('api/auth/refresh.md'),
                },
                'api/user': {
                    me: method('api/user/me.md'),
                },
            },
            guards: {
                JwtUserGuard: guard('JwtUserGuard.md'),
                JwtUserRefreshGuard: guard('JwtUserRefreshGuard.md'),
            },
        };
    },
};
