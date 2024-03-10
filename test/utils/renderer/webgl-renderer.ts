import { Color, clamp } from '..';

export class WebGlRenderer {
    private _canvas: HTMLCanvasElement;
    private _gl: WebGL2RenderingContext | WebGLRenderingContext;

    private _program: WebGLProgram;
    private _positionLocation: number;
    private _textureLocation: WebGLUniformLocation;
    private _pixelBuffer: Uint8Array;
    private _texture: WebGLTexture;
    private _surface: WebGLBuffer;

    public pixelRatio: number = window.devicePixelRatio;

    public get width(): number { return this._canvas.width; }
    public get height(): number { return this._canvas.height; }

    constructor(canvas?: HTMLCanvasElement) {
        this._canvas = canvas ?? document.createElement('canvas');

        this._gl = (this._canvas.getContext('webgl2') ?? this._canvas.getContext('webgl'))!;

        this._program = this._gl.createProgram()!;

        const vertShader: WebGLShader = this._gl.createShader(this._gl.VERTEX_SHADER)!;
        this._gl.shaderSource(vertShader, `
            attribute vec2 a_position;
            varying vec2 v_texCoord;
            void main() {
                gl_Position = vec4(a_position.x, -a_position.y, 0.0, 1.0);
                v_texCoord = a_position * 0.5 + 0.5;
            }
        `);

        this._gl.compileShader(vertShader);
        this._gl.attachShader(this._program, vertShader);

        const fragShader: WebGLShader = this._gl.createShader(this._gl.FRAGMENT_SHADER)!;
        this._gl.shaderSource(fragShader, `
            precision mediump float;
            uniform sampler2D u_texture;
            varying vec2 v_texCoord;
            void main() {
                gl_FragColor = texture2D(u_texture, v_texCoord);
            }
        `);

        this._gl.compileShader(fragShader);
        this._gl.attachShader(this._program, fragShader);

        this._gl.linkProgram(this._program);
        this._gl.useProgram(this._program);

        this._positionLocation = this._gl.getAttribLocation(this._program, 'a_position');
        this._textureLocation = this._gl.getUniformLocation(this._program, 'u_texture')!;

        this._pixelBuffer = new Uint8Array(this._canvas.width * this._canvas.height * 4);

        this._texture = this._gl.createTexture()!;
        this._bindTexture();

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.NEAREST);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.NEAREST);

        this._surface = this._gl.createBuffer()!;
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._surface);
        this._gl.bufferData(
            this._gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            this._gl.STATIC_DRAW
        );

        this._gl.enableVertexAttribArray(this._positionLocation);
        this._gl.vertexAttribPointer(this._positionLocation, 2, this._gl.FLOAT, false, 0, 0);

        this._gl.activeTexture(this._gl.TEXTURE0);
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture);
        this._gl.uniform1i(this._textureLocation, 0);
    }

    private _bindTexture(): void {
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture);

        this._gl.texImage2D(
            this._gl.TEXTURE_2D,
            0,
            this._gl.RGBA,
            this._canvas.width,
            this._canvas.height,
            0,
            this._gl.RGBA,
            this._gl.UNSIGNED_BYTE,
            this._pixelBuffer
        );
    }

    appendTo(target: HTMLElement | null, autoResize: boolean = true): void {
        if (this._canvas.parentNode) {
            this._canvas.parentNode.removeChild(this._canvas);
        }

        if (target) {
            target.appendChild(this._canvas);

            if (autoResize) {
                this.resize();
            }
        }
    }

    resize(displayWidth?: number, displayHeight?: number): boolean {
        const { width, height } = (
            this._canvas.parentElement?.getBoundingClientRect() ??
            this._canvas.getBoundingClientRect()
        );

        displayWidth = (0 | (displayWidth ?? width) * this.pixelRatio);
        displayHeight = (0 | (displayHeight ?? height) * this.pixelRatio);

        if (this._canvas.width !== displayWidth || this._canvas.height !== displayHeight) {
            this._canvas.width = displayWidth
            this._canvas.height = displayHeight;

            this._gl.viewport(0, 0, displayWidth, displayHeight);
            this._pixelBuffer = new Uint8Array(displayWidth * displayHeight * 4);
            this._bindTexture();

            return true;
        }

        return false;
    }

    private _setPixel(x: number, y: number, color: Color): void {
        const offset: number = ((y * this._canvas.width + x) * 4);

        this._pixelBuffer[offset] = color.r;
        this._pixelBuffer[offset + 1] = color.g;
        this._pixelBuffer[offset + 2] = color.b;
        this._pixelBuffer[offset + 3] = color.a;
    }

    setPixel(x: number, y: number, color: Color, size: number = 2): void {
        x = (0 | clamp(x, 0, this._canvas.width - size));
        y = (0 | clamp(y, 0, this._canvas.height - size));

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                this._setPixel(x + i, y + j, color);
            }
        }
    }

    render(): void {
        this._bindTexture();
        this._gl.drawArrays(this._gl.TRIANGLE_STRIP, 0, 4);
        this._pixelBuffer.fill(0);
    }
}