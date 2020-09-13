import {link, Material} from "../common/material.js";
import {GL_POINTS} from "../common/webgl.js";
import {ParticlesLayout} from "./layout_particles.js";

let vertex = `#version 300 es\n
    uniform mat4 K;
    uniform vec4 L,M,N;

    in vec4 A,B;
    out vec4 C;
    out float D;

    void main(){
        // Move the particle along the direction axis.
        gl_Position=K*vec4(A.xyz+B.xyz*N.y*A.w,1.);

        // Interpolate color and size.
        float t=A.w/N.x;
        gl_PointSize=mix(N.z,N.w,t);
        C=mix(L,M,t);

        // Random seed to pick the sprite.
        D=A.w*B.w*9.;
    }
`;

let fragment = `#version 300 es\n
    precision mediump float;

    uniform sampler2D O;

    in vec4 C;
    in float D;
    out vec4 E;

    void main(){
        // Add -1, 0, or 1 to each component of the point coord vector.
        E=C*texture(O,(gl_PointCoord+round(vec2(cos(D),sin(D))))/2.);
    }
`;

export function mat2_particles(gl: WebGL2RenderingContext): Material<ParticlesLayout> {
    let program = link(gl, vertex, fragment);
    return {
        Mode: GL_POINTS,
        Program: program,
        Locations: {
            Pv: gl.getUniformLocation(program, "K")!,
            ColorStart: gl.getUniformLocation(program, "L")!,
            ColorEnd: gl.getUniformLocation(program, "M")!,
            Details: gl.getUniformLocation(program, "N")!,
            Sampler: gl.getUniformLocation(program, "O")!,
            OriginAge: gl.getAttribLocation(program, "A")!,
            DirectionSeed: gl.getAttribLocation(program, "B")!,
        },
    };
}
