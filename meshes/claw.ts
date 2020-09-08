import {Mesh} from "../common/material.js";
import {GL_ARRAY_BUFFER, GL_ELEMENT_ARRAY_BUFFER, GL_STATIC_DRAW} from "../common/webgl.js";

export function mesh_claw(gl: WebGLRenderingContext): Mesh {
    let vertex_buf = gl.createBuffer()!;
    gl.bindBuffer(GL_ARRAY_BUFFER, vertex_buf);
    gl.bufferData(GL_ARRAY_BUFFER, vertex_arr, GL_STATIC_DRAW);

    let normal_buf = gl.createBuffer()!;
    gl.bindBuffer(GL_ARRAY_BUFFER, normal_buf);
    gl.bufferData(GL_ARRAY_BUFFER, normal_arr, GL_STATIC_DRAW);

    let texcoord_buf = gl.createBuffer()!;
    gl.bindBuffer(GL_ARRAY_BUFFER, texcoord_buf);
    gl.bufferData(GL_ARRAY_BUFFER, texcoord_arr, GL_STATIC_DRAW);

    let index_buf = gl.createBuffer()!;
    gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, index_buf);
    gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, index_arr, GL_STATIC_DRAW);

    return {
        VertexBuffer: vertex_buf,
        VertexArray: vertex_arr,
        NormalBuffer: normal_buf,
        TexCoordBuffer: texcoord_buf,
        IndexBuffer: index_buf,
        IndexArray: index_arr,
        IndexCount: index_arr.length,
    };
}

// prettier-ignore
let vertex_arr = Float32Array.from([
    0, 0, 1,
    -1, 1, -1,
    0, -1, -1,
    0, -1, -1,
    1, 1, -1,
    0, 0, 1,
    1, 1, -1,
    -1, 1, -1,
    0, 0, 1,
    0, -1, -1,
    -1, 1, -1,
    1, 1, -1
]);

// prettier-ignore
let normal_arr = Float32Array.from([
    -0.8729, -0.4364, 0.2182,
    -0.8729, -0.4364, 0.2182,
    -0.8729, -0.4364, 0.2182,
    0.8729, -0.4364, 0.2182,
    0.8729, -0.4364, 0.2182,
    0.8729, -0.4364, 0.2182,
    0, 0.8944, 0.4472,
    0, 0.8944, 0.4472,
    0, 0.8944, 0.4472,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1
]);

// prettier-ignore
let texcoord_arr = Float32Array.from([
    0, 1,
    1, 0,
    0, 0,
    0, 0,
    1, 0,
    0, 1,
    0, 0,
    1, 0,
    0, 1,
    0, 0,
    0, 1,
    1, 0
]);

// prettier-ignore
let index_arr = Uint16Array.from([
    11, 10, 9,
    8, 7, 6,
    5, 4, 3,
    2, 1, 0
]);
