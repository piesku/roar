import {link, Material} from "../common/material.js";
import {GL_TRIANGLES} from "../common/webgl.js";
import {TexturedDiffuseLayout} from "./layout_textured_diffuse.js";

let vertex = `#version 300 es\n
    uniform mat4 K,L,M;

    in vec3 A,B;
    in vec2 C;
    out vec4 D;
    out vec3 E;
    out vec2 F;

    void main(){
        D=L*vec4(A,1.);
        E=(vec4(B,1.)*M).xyz;
        F=C;
        gl_Position=K*D;
    }
`;

let fragment = `#version 300 es\n
    precision mediump float;

    uniform vec4 N;
    uniform vec3 O;
    uniform float P,Q;
    uniform sampler2D R;
    // [x, y, z, w: kind]
    uniform vec4 S[8],T[8];

    in vec4 D;
    in vec3 E;
    in vec2 F;
    out vec4 G;

    void main() {
        vec3 a=normalize(E);

        // Ambient light.
        vec3 b=N.rgb*.2;

        for(int i=0;i<8;i++){
            if(S[i].w==0.)break;
            float c=T[i].a;

            vec3 d=S[i].xyz-D.xyz;
            float e=length(d);
            vec3 f=d/e;
            // Distance attenuation.
            c/=(e*e);

            float g=dot(a,f);
            if(g>0.){
                // Diffuse color.
                b+=N.xyz*T[i].xyz*(floor(g*c*4.)/4.);
            }
        }

        vec4 h=texture(R,F);
        if(h.a==0.)discard;

        G=vec4(b,N.a)*h;
        G=mix(G,vec4(0.,.1,.2,1.),smoothstep(2.,0.,D.y-Q));
        G=mix(G,vec4(0.,.1,.2,1.),smoothstep(0.0, 1.0, clamp(0.,1.,length(O-D.xyz)/P)));
    }
`;

export function mat2_textured_diffuse(gl: WebGL2RenderingContext): Material<TexturedDiffuseLayout> {
    let program = link(gl, vertex, fragment);
    return {
        Mode: GL_TRIANGLES,
        Program: program,
        Locations: {
            Pv: gl.getUniformLocation(program, "K")!,
            World: gl.getUniformLocation(program, "L")!,
            Self: gl.getUniformLocation(program, "M")!,
            Color: gl.getUniformLocation(program, "N")!,
            EyePosition: gl.getUniformLocation(program, "O")!,
            FogDistance: gl.getUniformLocation(program, "P")!,
            FogLevel: gl.getUniformLocation(program, "Q")!,
            Sampler: gl.getUniformLocation(program, "R")!,
            LightPositions: gl.getUniformLocation(program, "S")!,
            LightDetails: gl.getUniformLocation(program, "T")!,
            VertexPosition: gl.getAttribLocation(program, "A")!,
            VertexTexCoord: gl.getAttribLocation(program, "C")!,
            VertexNormal: gl.getAttribLocation(program, "B")!,
        },
    };
}
