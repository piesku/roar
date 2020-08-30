import {link, Material} from "../common/material.js";
import {GL_POINTS} from "../common/webgl.js";
import {ParticlesLayout} from "./layout_particles.js";

let vertex = `#version 300 es\n
    uniform mat4 pv;
    uniform vec4 color_start;
    uniform vec4 color_end;
    // [x: lifespan, y: speed, z: size_start, w: size_end];
    uniform vec4 details;

    // [x, y, z, w: age]
    in vec4 origin_age;
    in vec3 direction;
    out vec4 vert_color;

    void main() {
        vec4 origin = vec4(origin_age.xyz, 1.0);
        float age = origin_age.w;
        vec3 velocity = direction * details.y;

        // Move the particle along the direction axis.
        origin += vec4(velocity * age, 1.0);
        gl_Position = pv * origin;

        // Interpolate color and size.
        float t = age / details.x;
        gl_PointSize = mix(details.z, details.w, t);
        vert_color = mix(color_start, color_end, t);
    }
`;

let fragment = `#version 300 es\n
    precision mediump float;

    in vec4 vert_color;
    out vec4 frag_color;

    void main(){
        frag_color = vert_color;
    }
`;

export function mat2_particles(gl: WebGL2RenderingContext): Material<ParticlesLayout> {
    let program = link(gl, vertex, fragment);
    return {
        Mode: GL_POINTS,
        Program: program,
        Locations: {
            Pv: gl.getUniformLocation(program, "pv")!,
            ColorStart: gl.getUniformLocation(program, "color_start")!,
            ColorEnd: gl.getUniformLocation(program, "color_end")!,
            Details: gl.getUniformLocation(program, "details")!,
            OriginAge: gl.getAttribLocation(program, "origin_age")!,
            Direction: gl.getAttribLocation(program, "direction")!,
        },
    };
}
