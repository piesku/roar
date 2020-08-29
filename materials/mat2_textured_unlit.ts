import {link, Material} from "../common/material.js";
import {GL_TRIANGLES} from "../common/webgl.js";
import {TexturedUnlitLayout} from "./layout_textured_unlit.js";

let vertex = `#version 300 es\n
    uniform mat4 pv;
    uniform mat4 world;

    in vec3 position;
    in vec2 texcoord;
    out vec2 vert_texcoord;

    void main() {
        vec4 vert_pos = world * vec4(position, 1.0);
        vert_texcoord = texcoord;
        gl_Position = pv * vert_pos;
    }
`;

let fragment = `#version 300 es\n
    precision mediump float;

    uniform vec4 color;
    uniform sampler2D sampler;
    uniform vec2 texscale;

    in vec2 vert_texcoord;
    out vec4 frag_color;

    void main() {
        frag_color = color * texture(sampler, vert_texcoord * texscale);
    }
`;

export function mat2_textured_unlit(gl: WebGL2RenderingContext): Material<TexturedUnlitLayout> {
    let program = link(gl, vertex, fragment);
    return {
        Mode: GL_TRIANGLES,
        Program: program,
        Locations: {
            Pv: gl.getUniformLocation(program, "pv")!,
            World: gl.getUniformLocation(program, "world")!,
            Color: gl.getUniformLocation(program, "color")!,
            Sampler: gl.getUniformLocation(program, "sampler")!,
            TexScale: gl.getUniformLocation(program, "texscale")!,
            VertexPosition: gl.getAttribLocation(program, "position")!,
            VertexTexCoord: gl.getAttribLocation(program, "texcoord")!,
        },
    };
}
