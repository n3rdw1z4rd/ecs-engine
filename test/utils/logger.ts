const isDev: boolean = (process.env.NODE_ENV?.toLowerCase() !== 'production');

export class Logger {
    constructor(
        public prefix: string = '',
        public traceEnabled: boolean = false,
        public tracePrefix: string = '»',
    ) { }

    todo(...args: any[]): void {
        console.debug(
            '%c[TODO]%c ' + args.join(' '),
            'color: black; background-color: yellow; font-weight: bold;',
            'font-weight: bold;',
        );
    }

    trace(...args: any[]): void {
        if (this.traceEnabled) console.log(this.prefix, this.tracePrefix, ...args);
    }

    debug(...args: any[]): void {
        if (isDev) console.debug(this.prefix, ...args);
    }

    info(...args: any[]): void {
        console.info(this.prefix, ...args);
    }

    warn(...args: any[]): void {
        console.warn(this.prefix, ...args);
    }

    error(...args: any[]): void {
        console.error(this.prefix, ...args);
    }

    throw(...args: any[]): void {
        throw `[${this.prefix}] ${args.join(' ')}`;
    }
}