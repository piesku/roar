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
    // [x, y, z, w: seed]
    in vec4 direction_seed;
    out vec4 vert_color;
    out float rand;

    void main() {
        // Move the particle along the direction axis.
        vec3 velocity = direction_seed.xyz * details.y;
        gl_Position = pv * vec4(origin_age.xyz + velocity * origin_age.w, 1.0);

        // Interpolate color and size.
        float t = origin_age.w / details.x;
        gl_PointSize = mix(details.z, details.w, t);
        vert_color = mix(color_start, color_end, t);

        // Random seed to pick the sprite.
        rand = origin_age.w * direction_seed.w * 9.0;
    }
`;

let fragment = `#version 300 es\n
    precision mediump float;

    uniform sampler2D sampler;

    in vec4 vert_color;
    in float rand;
    out vec4 frag_color;

    void main(){
        // Add -1, 0, or 1 to each component of the point coord vector.
        vec2 uv = gl_PointCoord + round(vec2(cos(rand), sin(rand)));
        frag_color = vert_color * texture(sampler, uv / 2.0);
    }
`;

export function mat2_particles(gl: WebGL2RenderingContext): Material<ParticlesLayout> {
    let program = link(gl, vertex, fragment);
    return {
        Mode: GL_POINTS,
        Program: program,
        Locations: {
            Pv: gl.getUniformLocation(program, "pv")!,
            Sampler: gl.getUniformLocation(program, "sampler")!,
            ColorStart: gl.getUniformLocation(program, "color_start")!,
            ColorEnd: gl.getUniformLocation(program, "color_end")!,
            Details: gl.getUniformLocation(program, "details")!,
            OriginAge: gl.getAttribLocation(program, "origin_age")!,
            DirectionSeed: gl.getAttribLocation(program, "direction_seed")!,
        },
    };
}
