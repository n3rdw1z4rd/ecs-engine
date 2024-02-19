import { vec2, vec4 } from 'gl-matrix';

const DEFAULT_LINE_COLOR = 'white';
const DEFAULT_FILL_COLOR = 'white';
const DEFAULT_FONT_NAME = 'monospace';
const DEFAULT_FONT_SIZE = 24;
const DEFAULT_LINE_WIDTH = 1;
const DEFAULT_SCALE = 1.0;
const DEFAULT_SHADOW_BLUR = 0;
const DEFAULT_SHADOW_COLOR = 'grey';
const DEFAULT_TEXT_ALIGN = 'start';
const DEFAULT_TEXT_BASE_LINE = 'alphabetic';

export declare type RenderLoopStats = { time: number, deltaTime: number, fps: number };
export declare type RenderLoopCallback = (stats: RenderLoopStats) => void;

export interface DrawParams {
    centered?: boolean,
    fillColor?: string | CanvasGradient | CanvasPattern,
    filled?: boolean,
    fontName?: string,
    fontSize?: number,
    lineColor?: string | CanvasGradient | CanvasPattern,
    lineWidth?: number,
    outline?: boolean,
    padding?: number,
    shadowBlur?: number,
    shadowColor?: string,
    textAlign?: CanvasTextAlign,
    textBaseline?: CanvasTextBaseline,
};

const DEFAULT_DRAW_PARAMS: DrawParams = {
    centered: true,
    filled: true,
    padding: 0,
};

export class CanvasRenderer {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;

    private _center: vec2 = vec2.create();
    private _origin: vec2 = vec2.create();

    private _fillColor: string | CanvasGradient | CanvasPattern = DEFAULT_FILL_COLOR;
    private _fontName: string = DEFAULT_FONT_NAME;
    private _fontSize: number = DEFAULT_FONT_SIZE;
    private _lineColor: string | CanvasGradient | CanvasPattern = DEFAULT_LINE_COLOR;
    private _lineWidth: number = DEFAULT_LINE_WIDTH;
    private _scale: number = DEFAULT_SCALE;
    private _shadowBlur: number = DEFAULT_SHADOW_BLUR;
    private _shadowColor: string = DEFAULT_SHADOW_COLOR;
    private _textAlign: CanvasTextAlign = DEFAULT_TEXT_ALIGN;
    private _textBaseline: CanvasTextBaseline = DEFAULT_TEXT_BASE_LINE;

    get width(): number { return this._canvas.width; }
    get height(): number { return this._canvas.height; }

    get center(): vec2 { return this._center; }

    get origin(): vec2 { return this._origin; }
    set origin(position: vec2) { this._origin = position; }

    get lineColor(): string | CanvasGradient | CanvasPattern { return this._lineColor; }
    set lineColor(value: string | CanvasGradient | CanvasPattern) {
        this._lineColor = value;
        this._updateContextStyle();
    }

    get fillColor(): string | CanvasGradient | CanvasPattern { return this._fillColor; }
    set fillColor(value: string | CanvasGradient | CanvasPattern) {
        this._fillColor = value;
        this._updateContextStyle();
    }

    get fontName(): string { return this._fontName; }
    set fontName(value: string) {
        this._fontName = value;
        this._updateContextStyle();
    }

    get fontSize(): number { return this._fontSize; }
    set fontSize(value: number) {
        this._fontSize = value;
        this._updateContextStyle();
    }

    get lineWidth(): number { return this._lineWidth; }
    set lineWidth(value: number) {
        this._lineWidth = value;
        this._updateContextStyle();
    }

    get shadowBlur(): number { return this._shadowBlur; }
    set shadowBlur(value: number) {
        this._shadowBlur = value;
        this._updateContextStyle();
    }

    get shadowColor(): string { return this._shadowColor; }
    set shadowColor(value: string) {
        this._shadowColor = value;
        this._updateContextStyle();
    }

    get textAlign(): CanvasTextAlign { return this._textAlign; }
    set textAlign(value: CanvasTextAlign) {
        this._textAlign = value;
        this._updateContextStyle();
    }

    get textBaseline(): CanvasTextBaseline { return this._textBaseline; }
    set textBaseLine(value: CanvasTextBaseline) {
        this._textBaseline = value;
        this._updateContextStyle();
    }

    get scale(): number { return this._scale; }
    set scale(value: number) {
        if (value < 0.0 || value > 0.0) {
            this._scale = value;
            this._ctx.scale(value, value);
            this._updateContextStyle();
        } else throw 'Canvas: parameter "scale" must be non-zero';
    }

    constructor(canvas?: HTMLCanvasElement) {
        this._canvas = canvas ?? document.createElement('canvas');
        this._canvas.style.display = 'block';

        this._ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D;

        if (!this._ctx) throw 'Canvas2D: cannot get a CanvasRenderingContext2D';

        this.clear();
    }

    appendTo(targetElement?: HTMLElement, autoResizeToParent: boolean = true): this {
        if (this._canvas.parentNode) {
            this._canvas.parentNode.removeChild(this._canvas);
        }

        if (targetElement) {
            targetElement.appendChild(this._canvas);

            if (autoResizeToParent === true) {
                this.resize();
            }
        }

        return this;
    }

    clear(fillStyle?: string | CanvasGradient | CanvasPattern): this {
        if (fillStyle) {
            this._ctx.fillStyle = fillStyle;
            this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
        } else {
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }

        return this;
    }

    resize(displayWidth?: number, displayHeight?: number): boolean {
        const { width, height } = (
            this._canvas.parentElement?.getBoundingClientRect() ??
            this._canvas.getBoundingClientRect()
        );

        displayWidth = (0 | (displayWidth ?? width));
        displayHeight = (0 | (displayHeight ?? height));

        if (this._canvas.width !== displayWidth || this._canvas.height !== displayHeight) {
            this._canvas.width = displayWidth
            this._canvas.height = displayHeight;

            const diff: vec2 = this._center;

            this._center[0] = displayWidth / 2.0;
            this._center[1] = displayHeight / 2.0;

            // vec2.subtract(diff, diff, this._center);
            // vec2.subtract(this._origin, this._origin, diff);

            this._updateContextStyle();

            return true;
        }

        return false;
    }

    private _updateContextStyle(params: DrawParams = {}) {
        this._ctx.strokeStyle = params.lineColor ?? this._lineColor;
        this._ctx.fillStyle = params.fillColor ?? this._fillColor;
        this._ctx.lineWidth = params.lineWidth ?? this._lineWidth;
        this._ctx.font = `${params.fontSize ?? this._fontSize}px ${params.fontName ?? this._fontName}`;
        this._ctx.textAlign = params.textAlign ?? this._textAlign;
        this._ctx.textBaseline = params.textBaseline ?? this._textBaseline;
        this._ctx.shadowBlur = params.shadowBlur ?? this._shadowBlur;
        this._ctx.shadowColor = params.shadowColor ?? this._shadowColor;
    }

    private _applyOrigin(target: vec2 | vec4) {
        target[0] += this._origin[0];
        target[1] += this._origin[1];
    }

    drawCircle(position: vec2, radius: number, params: DrawParams = DEFAULT_DRAW_PARAMS) {
        params = { ...DEFAULT_DRAW_PARAMS, ...params };

        this._updateContextStyle(params);
        this._applyOrigin(position);

        if (params.centered === false) {
            position[0] += radius;
            position[1] += radius;
        }

        this._ctx.beginPath();
        this._ctx.arc(position[0], position[1], radius, 0, (Math.PI * 2));
        this._ctx.stroke();

        if (params.filled) this._ctx.fill();
    }

    drawPoint(position: vec2, params: DrawParams = DEFAULT_DRAW_PARAMS) {
        this.drawCircle(position, 1.0, params);
    }

    drawLine(startPosition: vec2, endPosition: vec2, params: DrawParams = DEFAULT_DRAW_PARAMS) {
        params = { ...DEFAULT_DRAW_PARAMS, ...params };
        // startPosition = vec2.fromValues(startPosition[0], startPosition[1]);
        // endPosition = vec2.fromValues(endPosition[0], endPosition[1]);

        this._updateContextStyle(params);
        this._applyOrigin(startPosition);
        this._applyOrigin(endPosition);

        this._ctx.beginPath();
        this._ctx.moveTo(startPosition[0], startPosition[1]);
        this._ctx.lineTo(endPosition[0], endPosition[1]);
        this._ctx.stroke();
    }

    drawRect(rect: vec4, params: DrawParams = DEFAULT_DRAW_PARAMS) {
        params = { ...DEFAULT_DRAW_PARAMS, ...params };

        this._updateContextStyle(params);

        if (params.centered) {
            rect[0] -= (rect[2] / 2.0);
            rect[1] -= (rect[3] / 2.0);
        }

        rect[0] += params.padding;
        rect[1] += params.padding;
        rect[2] -= params.padding;
        rect[3] -= params.padding;

        this._applyOrigin(rect);

        this._ctx.beginPath();
        this._ctx.rect(rect[0], rect[1], rect[2], rect[3]);
        this._ctx.stroke();

        if (params.filled) this._ctx.fill();
    }

    drawText(position: vec2, text: string | number, params: DrawParams = DEFAULT_DRAW_PARAMS) {
        params = { ...DEFAULT_DRAW_PARAMS, ...params };
        // position = vec2.fromValues(position[0], position[1]);

        this._updateContextStyle(params);
        this._applyOrigin(position);

        // pos[0] += params.fontOffset?[0] ?? this.style.fontOffset[0];
        // pos[1] += params.fontOffset?[1] ?? this.style.fontOffset[1];

        this._ctx[(params.outline === true) ? 'strokeText' : 'fillText'](
            `${text}`,
            position[0],
            position[1] + (this._fontSize / 4.0),
        );
    }

    drawImage(
        imageSrc: CanvasImageSource,
        dstX: number, dstY: number, dstWidth?: number, dstHeight?: number,
        srcX?: number, srcY?: number, srcWidth?: number, srcHeight?: number
    ) {
        const pos: vec2 = vec2.fromValues(dstX, dstY);
        this._applyOrigin(pos);

        if (arguments.length > 5) {
            this._ctx.drawImage(imageSrc, srcX, srcY, srcWidth, srcHeight, pos[0], pos[1], dstWidth, dstHeight);
        } else if (arguments.length > 3) {
            this._ctx.drawImage(imageSrc, pos[0], pos[1], dstWidth, dstHeight);
        } else {
            this._ctx.drawImage(imageSrc, pos[0], pos[1]);
        }
    }
}