// import './utils/css';

// const canvas: HTMLCanvasElement = document.createElement('canvas');
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;
// document.body.appendChild(canvas);

// const gl: WebGL2RenderingContext = canvas.getContext('webgl2')!;
// gl.clearColor(0.0, 0.0, 0.0, 1.0);

// // Vertex shader source code
// const vsSource: string = `
//     attribute vec2 a_position;
//     varying vec2 v_texCoord;
//     void main() {
//         gl_Position = vec4(a_position, 0.0, 1.0);
//         v_texCoord = a_position * 0.5 + 0.5;
//     }
// `;

// // Fragment shader source code
// const fsSource: string = `
//     precision mediump float;
//     uniform sampler2D u_texture;
//     varying vec2 v_texCoord;
//     void main() {
//         gl_FragColor = texture2D(u_texture, v_texCoord);
//     }
// `;

// // Create a new shader program
// const program: WebGLProgram = gl.createProgram()!;

// // Compile and attach the vertex shader
// const vs: WebGLShader = gl.createShader(gl.VERTEX_SHADER)!;
// gl.shaderSource(vs, vsSource);
// gl.compileShader(vs);
// gl.attachShader(program, vs);

// // Compile and attach the fragment shader
// const fs: WebGLShader = gl.createShader(gl.FRAGMENT_SHADER)!;
// gl.shaderSource(fs, fsSource);
// gl.compileShader(fs);
// gl.attachShader(program, fs);

// // Link the program and use it
// gl.linkProgram(program);
// gl.useProgram(program);

// // Get the locations of the attributes and uniforms
// const positionLocation: number = gl.getAttribLocation(program, 'a_position');
// const textureLocation: WebGLUniformLocation = gl.getUniformLocation(program, 'u_texture')!;

// // Create a new Uint8Array to hold the pixel data
// const pixels: Uint8Array = new Uint8Array(canvas.width * canvas.height * 4);
// for (let i = 0; i < pixels.length; i++) {
//     pixels[i] = Math.random() * 255;
// }

// // Create a new texture and bind it
// const texture: WebGLTexture = gl.createTexture()!;
// gl.bindTexture(gl.TEXTURE_2D, texture);

// // Upload the pixel data to the texture
// gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

// // Set the texture parameters
// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

// // Create a full-screen quad and draw it using the texture
// const quad: WebGLBuffer = gl.createBuffer()!;
// gl.bindBuffer(gl.ARRAY_BUFFER, quad);
// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

// // Enable the position attribute
// gl.enableVertexAttribArray(positionLocation);
// gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// // Draw the quad
// gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

// // Bind the texture to texture unit 0
// gl.activeTexture(gl.TEXTURE0);
// gl.bindTexture(gl.TEXTURE_2D, texture);
// gl.uniform1i(textureLocation, 0);

// function draw() {
//     // Update some of the pixels to be red
//     for (let i = 0; i < pixels.length; i += 4) {
//         if (Math.random() < 0.01) { // 1% chance for each pixel to turn red
//             pixels[i] = 255; // Red
//             pixels[i + 1] = 0; // Green
//             pixels[i + 2] = 0; // Blue
//         }
//     }

//     // Upload the updated pixel data to the texture
//     gl.bindTexture(gl.TEXTURE_2D, texture);
//     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

//     // Draw the quad
//     gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

//     // Request the next frame
//     requestAnimationFrame(draw);
// }

// // Start the animation loop
// // draw();