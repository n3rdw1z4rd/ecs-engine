const isDev: boolean = (process.env.NODE_ENV?.toLowerCase() !== 'production');

export class Logger {
    constructor(
        public prefix: string = '',
        public traceEnabled: boolean = false,
        public tracePrefix: string = '»',
    ) { }

    todo(...args: any[]) {
        console.debug(
            '%c[TODO]%c ' + args.join(' '),
            'color: black; background-color: yellow; font-weight: bold;',
            'font-weight: bold;',
        );
    }

    trace(...args: any[]) {
        if (this.traceEnabled) console.log(this.prefix, this.tracePrefix, ...args);
    }

    debug(...args: any[]) {
        if (isDev) console.debug(this.prefix, ...args);
    }

    info(...args: any[]) {
        console.info(this.prefix, ...args);
    }

    warn(...args: any[]) {
        console.warn(this.prefix, ...args);
    }

    error(...args: any[]) {
        console.error(this.prefix, ...args);
    }
}