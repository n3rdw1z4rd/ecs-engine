import { vec2 } from 'gl-matrix';
import { Color } from './types';
import { Logger } from '../engine';

const log: Logger = new Logger('[WebGLRenderer]');

export class WebGLRenderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram;
    private pixelBuffer: Uint8Array;
    private buffer: WebGLBuffer;
    private texture: WebGLTexture;

    public get width(): number { return this.canvas.width; }
    public get height(): number { return this.canvas.height; }

    constructor(canvas?: HTMLCanvasElement) {
        log.trace('constructor', { canvas });

        this.canvas = canvas ?? document.createElement('canvas');
        this.gl = this.canvas.getContext('webgl2');

        if (!this.gl) {
            throw new Error('WebGL2 not supported');
        }

        this.initProgram();
        this.initPixelBuffer();

        // Create texture
        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    }

    public clear() {
        log.trace('clear');

        // Calculate the size of the pixel buffer (width * height * 4)
        const size = this.canvas.width * this.canvas.height * 4;

        // Create a new pixel buffer and fill it with zeros
        this.pixelBuffer = new Uint8Array(size);
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

            this.initPixelBuffer();

            return true;
        }

        return false;
    }

    private initProgram() {
        log.trace('initProgram');

        // Create shaders
        const vertexShaderSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            uniform sampler2D u_texture;
            uniform vec2 u_resolution;
            uniform vec4 u_color;
            void main() {
                gl_FragColor = texture2D(u_texture, gl_FragCoord.xy / u_resolution);
            }
        `;

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        // Create program
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            throw new Error('Unable to initialize the shader program');
        }

        this.gl.useProgram(this.program);

        // Initialize the buffer
        this.buffer = this.gl.createBuffer();

        // Define quad vertices
        const vertices = [
            -1, 1,
            1, 1,
            -1, -1,
            -1, -1,
            1, 1,
            1, -1
        ];

        // Bind the buffer and upload the vertices to it
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        // Bind the buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

        // Set vertex attribute pointer
        const positionLocation = this.gl.getAttribLocation(this.program, 'position');
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(positionLocation);
    }

    private createShader(type: number, source: string): WebGLShader {
        log.trace('createShader', { type, source });

        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const info = this.gl.getShaderInfoLog(shader);
            this.gl.deleteShader(shader);
            throw new Error(`An error occurred compiling the shaders: ${info}`);
        }

        return shader;
    }

    private initPixelBuffer() {
        log.trace('initPixelBuffer');

        this.pixelBuffer = new Uint8Array(this.canvas.width * this.canvas.height * 4);
    }

    private _setPixel(x: number, y: number, color: Color): void {
        log.trace('_setPixel', { x, y, color });

        const ix: number = (x / this.canvas.width) * 2 - 1;
        const iy: number = 1 - (y / this.canvas.height) * 2;
        const index: number = (Math.round((iy + 1) / 2 * this.canvas.height) * this.canvas.width + Math.round((ix + 1) / 2 * this.canvas.width)) * 4;

        this.pixelBuffer[index] = color[0];
        this.pixelBuffer[index + 1] = color[1];
        this.pixelBuffer[index + 2] = color[2];
        this.pixelBuffer[index + 3] = color[3];
    }

    public setPixel(position: vec2, color: Color): void {
        log.trace('setPixel', { position, color });
        this._setPixel(position[0], position[1], color);
    }

    public drawRect(position: vec2, color: Color, size: number = 1, filled: boolean = true): void {
        log.trace('drawRect', { position, color, size });

        const width = this.canvas.width;
        const height = this.canvas.height;

        if (size == 1) {
            this.setPixel(position, color);
        } else {
            // Calculate the start and end points of the square
            const halfSize = size / 2;
            const startX = Math.max(Math.floor(position[0] - halfSize), 0);
            const startY = Math.max(Math.floor(position[1] - halfSize), 0);
            const endX = Math.min(Math.ceil(position[0] + halfSize), width);
            const endY = Math.min(Math.ceil(position[1] + halfSize), height);

            // Set the color for each pixel in the rectangle
            for (let y = startY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    if (filled) {
                        this._setPixel(x, y, color);
                    } else {
                        if (x === startX || x === endX - 1 || y === startY || y === endY - 1) {
                            this._setPixel(x, y, color);
                        }
                    }
                }
            }
        }
    }

    public render(): void {
        log.trace('render');

        // Resize the viewport to match the canvas size
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        this.gl.useProgram(this.program);

        // Update texture
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.canvas.width, this.canvas.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.pixelBuffer);

        // Clear canvas and draw the quad
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // Get the location of the uniforms
        const textureLocation = this.gl.getUniformLocation(this.program, 'u_texture');
        const resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');

        // Set the value of the uniforms
        this.gl.uniform1i(textureLocation, 0);  // Set texture unit to 0
        this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);  // Set resolution to canvas size

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
}