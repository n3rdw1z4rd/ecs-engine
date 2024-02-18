import { DEV } from './env';

export const log = DEV ? console.debug : () => { };
export const logInfo = console.info;
export const logWarn = console.warn;
export const logError = console.error;

export class Logger {
    constructor(
        public prefix: string = '',
        public traceEnabled: boolean = false,
        public tracePrefix: string = '»',
    ) { }

    todo(...args: any[]) {
        logWarn('*** TODO:', ...args);
    }

    trace(...args: any[]) {
        if (this.traceEnabled) log(this.prefix, this.tracePrefix, ...args);
    }

    debug(...args: any[]) {
        if (DEV) log(this.prefix, ...args);
    }

    info(...args: any[]) {
        logInfo(this.prefix, ...args);
    }

    warn(...args: any[]) {
        logWarn(this.prefix, ...args);
    }

    error(...args: any[]) {
        logError(this.prefix, ...args);
    }
}