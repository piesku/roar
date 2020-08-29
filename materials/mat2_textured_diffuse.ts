import {link, Material} from "../common/material.js";
import {GL_TRIANGLES} from "../common/webgl.js";
import {TexturedDiffuseLayout} from "./layout_textured_diffuse.js";

let vertex = `#version 300 es\n
    const int MAX_LIGHTS = 8;

    uniform mat4 pv;
    uniform mat4 world;
    uniform mat4 self;
    uniform vec4 color;
    uniform vec4 light_positions[MAX_LIGHTS];
    uniform vec4 light_details[MAX_LIGHTS];

    in vec3 position;
    in vec2 texcoord;
    in vec3 normal;
    out vec2 vert_texcoord;
    out vec3 vert_color;

    void main() {
        vec4 vert_pos = world * vec4(position, 1.0);
        vec3 vert_normal = normalize((vec4(normal, 1.0) * self).xyz);
        gl_Position = pv * vert_pos;

        vert_texcoord = texcoord;

        // Ambient light.
        vert_color = vec3(0.1);

        for (int i = 0; i < MAX_LIGHTS; i++) {
            if (light_positions[i].w == 0.0) {
                break;
            }

            vec3 light_color = light_details[i].rgb;
            float light_intensity = light_details[i].a;

            vec3 light_normal;
            if (light_positions[i].w == 1.0) {
                // Directional light.
                light_normal = light_positions[i].xyz;
            } else {
                vec3 light_dir = light_positions[i].xyz - vert_pos.xyz;
                float light_dist = length(light_dir);
                light_normal = light_dir / light_dist;
                // Distance attenuation.
                light_intensity /= (light_dist * light_dist);
            }

            float diffuse_factor = dot(vert_normal, light_normal);
            if (diffuse_factor > 0.0) {
                // Diffuse color.
                vert_color += color.rgb * diffuse_factor * light_color * light_intensity;
            }
        }
    }
`;

let fragment = `#version 300 es
    precision mediump float;
    uniform sampler2D sampler;
    uniform float texoffset;

    in vec2 vert_texcoord;
    in vec3 vert_color;

    out vec4 frag_color;

    void main() {
        if (texoffset == 0.0) {
            frag_color = vec4(vert_color, 1.0) * texture(sampler, vert_texcoord);
        } else {
            frag_color = vec4(vert_color, 1.0) * texture(sampler, vert_texcoord + vec2(texoffset, 0.0));
        }

    }
`;

export function mat2_textured_diffuse(gl: WebGL2RenderingContext): Material<TexturedDiffuseLayout> {
    let program = link(gl, vertex, fragment);
    return {
        Mode: GL_TRIANGLES,
        Program: program,
        Locations: {
            Pv: gl.getUniformLocation(program, "pv")!,
            World: gl.getUniformLocation(program, "world")!,
            Self: gl.getUniformLocation(program, "self")!,
            Color: gl.getUniformLocation(program, "color")!,
            Sampler: gl.getUniformLocation(program, "sampler")!,
            TexOffset: gl.getUniformLocation(program, "texoffset")!,
            LightPositions: gl.getUniformLocation(program, "light_positions")!,
            LightDetails: gl.getUniformLocation(program, "light_details")!,
            VertexPosition: gl.getAttribLocation(program, "position")!,
            VertexTexCoord: gl.getAttribLocation(program, "texcoord")!,
            VertexNormal: gl.getAttribLocation(program, "normal")!,
        },
    };
}
