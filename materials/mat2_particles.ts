import {link, Material} from "../common/material.js";
import {GL_POINTS} from "../common/webgl.js";
import {ParticlesLayout} from "./layout_particles.js";

let vertex = `#version 300 es\n
    uniform mat4 pv;
    // [red, green, blue, alpha]
    uniform vec4 color_start;
    uniform vec4 color_end;
    // [lifespan, size_start, size_end];
    uniform vec3 lifespan_size;

    // [x, y, z, age]
    in vec4 origin_age;
    // [x, y, z, speed]
    in vec4 direction_speed;
    out vec4 vert_color;

    void main() {
        vec4 origin = vec4(origin_age.xyz, 1.0);
        float age = origin_age.w;
        vec3 velocity = direction_speed.xyz * direction_speed.w;

        origin += vec4(velocity * age, 1.0);

        float t = age / lifespan_size.x;
        gl_PointSize = mix(lifespan_size.y, lifespan_size.z, t);
        gl_Position = pv * origin;
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
            LifespanSize: gl.getUniformLocation(program, "lifespan_size")!,
            OriginAge: gl.getAttribLocation(program, "origin_age")!,
            DirectionSpeed: gl.getAttribLocation(program, "direction_speed")!,
        },
    };
}
