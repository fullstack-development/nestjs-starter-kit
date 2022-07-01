import * as dateFns from 'date-fns';
import { Injectable, Module } from '@nestjs/common';

enum ANSIControlChar {
    Reset = '\x1b[0m',
    Bright = '\x1b[1m',
    Dim = '\x1b[2m',
    Underscore = '\x1b[4m',
    Blink = '\x1b[5m',
    Reverse = '\x1b[7m',
    Hidden = '\x1b[8m',

    FgBlack = '\x1b[30m',
    FgRed = '\x1b[31m',
    FgGreen = '\x1b[32m',
    FgYellow = '\x1b[33m',
    FgBlue = '\x1b[34m',
    FgMagenta = '\x1b[35m',
    FgCyan = '\x1b[36m',
    FgWhite = '\x1b[37m',

    BgBlack = '\x1b[40m',
    BgRed = '\x1b[41m',
    BgGreen = '\x1b[42m',
    BgYellow = '\x1b[43m',
    BgBlue = '\x1b[44m',
    BgMagenta = '\x1b[45m',
    BgCyan = '\x1b[46m',
    BgWhite = '\x1b[47m',
}

@Injectable()
export class LoggerProvider {
    private static makeMessage(msg: string, color: ANSIControlChar) {
        return `${color}[Nest] ${process.pid}   - ${
            ANSIControlChar.Reset
        }${LoggerProvider.now()}   ${ANSIControlChar.FgYellow}[Logger] ${color}${msg}${
            ANSIControlChar.Reset
        }`;
    }

    private static now() {
        return dateFns.format(new Date(Date.now()), 'dd.MM.yyyy, HH:mm:ss');
    }

    public log(msg: string) {
        // eslint-disable-next-line no-console
        console.log(LoggerProvider.makeMessage(msg, ANSIControlChar.FgCyan));
    }

    public error(msg: string) {
        // eslint-disable-next-line no-console
        console.error(LoggerProvider.makeMessage(msg, ANSIControlChar.FgRed));
    }
}

@Module({
    providers: [LoggerProvider],
    exports: [LoggerProvider],
})
export class Logger {}
