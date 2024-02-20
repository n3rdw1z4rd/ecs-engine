import { vec2 } from 'gl-matrix';
import { Logger } from '../engine';
import { Color } from './types';

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

    public setPixel(position: vec2, color: Color): void {
        log.trace('setPixel', { position, color });

        this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
        this.ctx.fillRect(position[0], position[1], 1, 1);
    }

    public drawRect(position: vec2, color: Color, size: number = 1): void {
        log.trace('drawRect', { position, color, size });

        this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
        this.ctx.fillRect(position[0] - size / 2, position[1] - size / 2, size, size);
    }

    public drawCircle(position: vec2, color: Color, radius: number = 1, filled: boolean = true): void {
        log.trace('drawCircle', { position, color, radius, filled });

        this.ctx.beginPath();
        this.ctx.arc(position[0], position[1], radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
        this.ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;

        if (filled) {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
    }
}