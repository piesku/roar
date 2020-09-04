import {GL_FRAGMENT_SHADER, GL_VERTEX_SHADER} from "./webgl.js";

export interface Mesh {
    VertexBuffer: WebGLBuffer;
    VertexArray: Float32Array;
    NormalBuffer: WebGLBuffer;
    TexCoordBuffer: WebGLBuffer;
    IndexBuffer: WebGLBuffer;
    IndexArray: Uint16Array;
    IndexCount: number;
}

export interface Material<L> {
    Mode: GLenum;
    Program: WebGLProgram;
    Locations: L;
}

export function link(gl: WebGLRenderingContext, vertex: string, fragment: string) {
    let program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, GL_VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl, GL_FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    return program;
}

function compile(gl: WebGLRenderingContext, type: GLenum, source: string) {
    let shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}
