import { Logger } from '..';

import './reset.css';
import './styles.css';

export type Color = string | CanvasGradient | CanvasPattern;

const log: Logger = new Logger('[Canvas2DRenderer]');

export class CanvasRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    public get width(): number { return this.canvas.width; }
    public get height(): number { return this.canvas.height; }

    constructor(canvas?: HTMLCanvasElement) {
        log.trace('constructor', { canvas });

        this.canvas = canvas ?? document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        if (!this.ctx) {
            throw new Error('Canvas 2D context not supported');
        }
    }

    public clear() {
        log.trace('clear');

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public appendTo(element?: HTMLElement, resize: boolean = true): this {
        log.trace('appendTo', { element, resize });

        if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }

        if (element) {
            element.appendChild(this.canvas);

            if (resize === true) {
                this.resize();
            }
        }

        return this;
    }

    public resize(displayWidth?: number, displayHeight?: number): boolean {
        log.trace('resize', { displayWidth, displayHeight });

        const { width, height } = (
            this.canvas.parentElement?.getBoundingClientRect() ??
            this.canvas.getBoundingClientRect()
        );

        displayWidth = (0 | (displayWidth ?? width));
        displayHeight = (0 | (displayHeight ?? height));

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth
            this.canvas.height = displayHeight;

            return true;
        }

        return false;
    }

    public setPixel(x: number, y: number, color: Color): void {
        log.trace('setPixel', { x, y, color });

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, 1, 1);
    }

    public drawRect(x: number, y: number, color: Color, size: number = 1): void {
        log.trace('drawRect', { x, y, color, size });

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }

    public drawCircle(x: number, y: number, color: Color, radius: number = 1, filled: boolean = true): void {
        log.trace('drawCircle', { x, y, color, radius, filled });

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;

        if (filled) {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
    }
}