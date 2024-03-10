import { Color } from './color';

export class CanvasRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    get width(): number { return this.canvas.width; }
    get height(): number { return this.canvas.height; }

    pixelRatio: number = window.devicePixelRatio;

    constructor(canvas?: HTMLCanvasElement) {
        this.canvas = canvas ?? document.createElement('canvas');

        this.ctx = this.canvas.getContext('2d')!;

        if (!this.ctx) {
            throw 'Failed to create CanvasRenderingContext2D';
        }
    }

    appendTo(target: HTMLElement | null, autoResize: boolean = true): void {
        if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }

        if (target) {
            target.appendChild(this.canvas);

            if (autoResize) {
                this.resize();
            }
        }
    }

    resize(displayWidth?: number, displayHeight?: number): boolean {
        const { width, height } = (
            this.canvas.parentElement?.getBoundingClientRect() ??
            this.canvas.getBoundingClientRect()
        );

        displayWidth = (0 | (displayWidth ?? width) * this.pixelRatio);
        displayHeight = (0 | (displayHeight ?? height) * this.pixelRatio);

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth
            this.canvas.height = displayHeight;

            return true;
        }

        return false;
    }

    clear(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setPixel(x: number, y: number, color: Color, size: number = 2): void {
        this.ctx.fillStyle = color.hexStr;
        this.ctx.fillRect(x - (size / 2), y - (size / 2), size, size);
    }
}