export class RandomNumberGenerator {
    private _seed: number = Date.now();

    public get seed(): number { return this._seed; }
    public set seed(seed: number) { this._seed = seed; }

    public get nextf(): number {
        return this._rng();
    }

    public get nexti(): number {
        return (0 | (this.nextf * 2147483647));
    }

    constructor() {

    }

    private _rng = (): number => {
        // adapted from: https://github.com/bryc/code/blob/master/jshash/PRNGs.md#splitmix32

        this._seed |= 0;
        this._seed = this._seed + 0x9e3779b9 | 0;

        let t: number = this._seed ^ this._seed >>> 16;
        t = Math.imul(t, 0x21f0aaad);
        t = t ^ t >>> 15;
        t = Math.imul(t, 0x735a2d97);

        return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
    };

    public rangei(min: number, max?: number) {
        if (max == undefined) {
            max = min;
            min = 0;
        }

        return (min + this.nexti % (max - min));
    }

    public choose(values: any[] | string, ...args: any[]): any {
        if (args.length > 0) {
            if (Array.isArray(values)) {
                values = [...values, ...args];
            } else {
                values = [values, ...args];
            }
        } else if (!Array.isArray(values)) {
            values = values.split('');
        }

        return values[this.nexti % values.length];
    }

    public shuffle(values: any[] | string): any[] | string {
        if (Array.isArray(values)) {
            return values.sort((a, b) => (0.5 - this.nextf)) as Array<any>;
        } else {
            return values.split('').sort((a, b) => (0.5 - this.nextf)).join('') as string;
        }
    }

    public uid(length: number = 16): string {
        const charPool: string = this.shuffle('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') as string;
        const uid: string[] = [];

        while (uid.length < length) uid.push(this.choose(charPool));

        return uid.join('');
    }

    public pointInCircle(radius: number = 1.0, round: boolean = false): { x: number, y: number } {
        const t = 2 * Math.PI * this.nextf;
        const u = this.nextf + this.nextf;
        const r = u > 1 ? 2 - u : u;

        let x = radius * r * Math.cos(t);
        let y = radius * r * Math.sin(t);

        if (round === true) {
            x = Math.round(x);
            y = Math.round(y);
        }

        return { x, y };
    }
}

export const rng: RandomNumberGenerator = new RandomNumberGenerator();