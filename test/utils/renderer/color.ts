import { clamp } from '../math';

export class Color {
    private _hex: string = '#ffffffff';
    private _r: number = 255;
    private _g: number = 255;
    private _b: number = 255;
    private _a: number = 255;

    public get r(): number { return this._r; }
    public set r(value: number) {
        this._r = clamp(value, 0, 255);
        this._hex = this._to_hex();
    }

    public get g(): number { return this._g; }
    public set g(value: number) {
        this._g = clamp(value, 0, 255);
        this._hex = this._to_hex();
    }

    public get b(): number { return this._b; }
    public set b(value: number) {
        this._b = clamp(value, 0, 255);
        this._hex = this._to_hex();
    }

    public get a(): number { return this._a; }
    public set a(value: number) {
        this._a = clamp(value, 0, 255);
        this._hex = this._to_hex();
    }

    public get hexStr(): string { return this._hex; }
    public set hexStr(value: string) {
        if (value.startsWith('#')) {
            [this._r, this._g, this._b, this._a] = this._parse_hex_color_string(value);
            this._hex = value;
        } else {
            console.warn(`Color: invalid color string: ${value}. Should be a hexadecimal color string (i.e.: '#ffffff' or '#ffffffff'). Keeping the current color.`);
        }
    }

    constructor(r: string | number = 255, g: number = 255, b: number = 255, a: number = 255) {
        if (typeof r === 'string') {
            if (r.startsWith('#')) {
                [r, g, b, a] = this._parse_hex_color_string(r);
            } else {
                console.warn(`Color: invalid color string: ${r}. Should be a hexadecimal color string (i.e.: '#ffffff' or '#ffffffff'). Defaulting to opaque white.`);
                r = g = b = a = 255;
            }
        } else {
            [r, g, b, a] = [r, g, b, a].map(n => clamp((n * 255), 0, 255));
        }

        this.r = r as number;
        this.g = g as number;
        this.b = b as number;
        this.a = a as number;
    }

    private _to_hex(): string {
        return `#${this.r.toString(16).padStart(2, '0')}${this.g.toString(16).padStart(2, '0')}${this.b.toString(16).padStart(2, '0')}${this.a.toString(16).padStart(2, '0')}`;
    }

    private _parse_hex_color_string(hex: string): number[] {
        const result: RegExpExecArray | null = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);

        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
            result[4] ? parseInt(result[4], 16) : 255
        ] : [255, 255, 255, 255];
    }

    public static get Black(): Color { return new Color(0, 0, 0, 255); }
    public static get DarkGray(): Color { return new Color(64, 64, 64, 255); }
    public static get Gray(): Color { return new Color(128, 128, 128, 255); }
    public static get LightGray(): Color { return new Color(191, 191, 191, 255); }
    public static get White(): Color { return new Color(255, 255, 255, 255); }
    public static get LightRed(): Color { return new Color(255, 128, 128, 255); }
    public static get Red(): Color { return new Color(255, 0, 0, 255); }
    public static get DarkRed(): Color { return new Color(128, 0, 0, 255); }
    public static get LightGreen(): Color { return new Color(128, 255, 128, 255); }
    public static get Green(): Color { return new Color(0, 255, 0, 255); }
    public static get DarkGreen(): Color { return new Color(0, 128, 0, 255); }
    public static get LightBlue(): Color { return new Color(128, 128, 255, 255); }
    public static get Blue(): Color { return new Color(0, 0, 255, 255); }
    public static get DarkBlue(): Color { return new Color(0, 0, 128, 255); }
    public static get Yellow(): Color { return new Color(255, 255, 0, 255); }
    public static get Orange(): Color { return new Color(255, 128, 0, 255); }
    public static get Purple(): Color { return new Color(128, 0, 128, 255); }
    public static get Cyan(): Color { return new Color(0, 255, 255, 255); }
    public static get Magenta(): Color { return new Color(255, 0, 255, 255); }

    public static get Transparent(): Color { return new Color(0, 0, 0, 0); }
}