import { Color, clamp } from '..';

export class WebGlRenderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext | WebGLRenderingContext;

    private program: WebGLProgram;
    private positionLocation: number;
    private textureLocation: WebGLUniformLocation;
    private pixelBuffer: Uint8Array;
    private texture: WebGLTexture;
    private surface: WebGLBuffer;

    public pixelRatio: number = window.devicePixelRatio;

    public get width(): number { return this.canvas.width; }
    public get height(): number { return this.canvas.height; }

    constructor(canvas?: HTMLCanvasElement) {
        this.canvas = canvas ?? document.createElement('canvas');

        this.gl = (this.canvas.getContext('webgl2') ?? this.canvas.getContext('webgl'))!;

        this.program = this.gl.createProgram()!;

        const vertShader: WebGLShader = this.gl.createShader(this.gl.VERTEX_SHADER)!;
        this.gl.shaderSource(vertShader, `
            attribute vec2 a_position;
            varying vec2 v_texCoord;
            void main() {
                gl_Position = vec4(a_position.x, -a_position.y, 0.0, 1.0);
                v_texCoord = a_position * 0.5 + 0.5;
            }
        `);

        this.gl.compileShader(vertShader);
        this.gl.attachShader(this.program, vertShader);

        const fragShader: WebGLShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)!;
        this.gl.shaderSource(fragShader, `
            precision mediump float;
            uniform sampler2D u_texture;
            varying vec2 v_texCoord;
            void main() {
                gl_FragColor = texture2D(u_texture, v_texCoord);
            }
        `);

        this.gl.compileShader(fragShader);
        this.gl.attachShader(this.program, fragShader);

        this.gl.linkProgram(this.program);
        this.gl.useProgram(this.program);

        this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.textureLocation = this.gl.getUniformLocation(this.program, 'u_texture')!;

        this.pixelBuffer = new Uint8Array(this.canvas.width * this.canvas.height * 4);

        this.texture = this.gl.createTexture()!;
        this._bindTexture();

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

        this.surface = this.gl.createBuffer()!;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.surface);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            this.gl.STATIC_DRAW
        );

        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.uniform1i(this.textureLocation, 0);
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

            this.gl.viewport(0, 0, displayWidth, displayHeight);
            this.pixelBuffer = new Uint8Array(displayWidth * displayHeight * 4);
            this._bindTexture();

            return true;
        }

        return false;
    }

    private _setPixel(x: number, y: number, color: Color): void {
        const offset: number = ((y * this.canvas.width + x) * 4);

        this.pixelBuffer[offset] = color.r;
        this.pixelBuffer[offset + 1] = color.g;
        this.pixelBuffer[offset + 2] = color.b;
        this.pixelBuffer[offset + 3] = color.a;
    }

    setPixel(x: number, y: number, color: Color, size: number = 2): void {
        x = (0 | clamp(x, 0, this.canvas.width - size));
        y = (0 | clamp(y, 0, this.canvas.height - size));

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                this._setPixel(x + i, y + j, color);
            }
        }
    }

    private _bindTexture(): void {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            this.canvas.width,
            this.canvas.height,
            0,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            this.pixelBuffer
        );
    }

    render(): void {
        this._bindTexture();
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.pixelBuffer.fill(0);
    }
}