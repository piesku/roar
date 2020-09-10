import {link, Material} from "../common/material.js";
import {GL_TRIANGLES} from "../common/webgl.js";
import {TexturedDiffuseLayout} from "./layout_textured_diffuse.js";

let vertex = `#version 300 es\n
    uniform mat4 pv;
    uniform mat4 world;
    uniform mat4 self;

    in vec3 position;
    in vec3 normal;
    in vec2 texcoord;
    out vec4 vert_pos;
    out vec3 vert_normal;
    out vec2 vert_texcoord;

    void main() {
        vert_pos = world * vec4(position, 1.0);
        vert_normal = (vec4(normal, 1.0) * self).xyz;
        vert_texcoord = texcoord;
        gl_Position = pv * vert_pos;
    }
`;

let fragment = `#version 300 es\n
    precision mediump float;

    // See Game.LightPositions and Game.LightDetails.
    const int MAX_LIGHTS = 8;

    uniform vec4 color;
    uniform vec3 eye_pos;
    uniform float fog_distance;
    uniform float fog_level;
    uniform sampler2D sampler;
    uniform vec2 texscale;
    uniform float texoffset;
    uniform vec4 light_positions[MAX_LIGHTS];
    uniform vec4 light_details[MAX_LIGHTS];

    in vec4 vert_pos;
    in vec3 vert_normal;
    in vec2 vert_texcoord;
    out vec4 frag_color;

    const float bands = 4.0;

    float posterize(float factor) {
        return floor(factor * bands) / bands;
    }

    void main() {
        vec3 frag_normal = normalize(vert_normal);

        // Ambient light.
        vec3 rgb = color.rgb * 0.2;

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

            float diffuse_factor = dot(frag_normal, light_normal);
            if (diffuse_factor > 0.0) {
                // Diffuse color.
                rgb += color.rgb * light_color * posterize(diffuse_factor * light_intensity);
            }
        }

        vec4 tex_color = texture(sampler, vert_texcoord * texscale);
        if (tex_color.a == 0.0) {
            discard;
        } else {
            frag_color = vec4(rgb, color.a) * tex_color;
            frag_color = mix(frag_color, vec4(0.0, 0.1, 0.2, 1.0), smoothstep(2.0, 0.0, vert_pos.y - fog_level));

            float eye_distance = length(eye_pos - vert_pos.xyz);
            float fog_amount = clamp(0.0, 1.0, eye_distance / fog_distance);
            frag_color = mix(frag_color, vec4(0.0, 0.1, 0.2, 1.0), smoothstep(0.0, 1.0, fog_amount));
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
            EyePosition: gl.getUniformLocation(program, "eye_pos")!,
            FogDistance: gl.getUniformLocation(program, "fog_distance")!,
            FogLevel: gl.getUniformLocation(program, "fog_level")!,
            Sampler: gl.getUniformLocation(program, "sampler")!,
            TexScale: gl.getUniformLocation(program, "texscale")!,
            TexOffset: gl.getUniformLocation(program, "texoffset")!,
            LightPositions: gl.getUniformLocation(program, "light_positions")!,
            LightDetails: gl.getUniformLocation(program, "light_details")!,
            VertexPosition: gl.getAttribLocation(program, "position")!,
            VertexTexCoord: gl.getAttribLocation(program, "texcoord")!,
            VertexNormal: gl.getAttribLocation(program, "normal")!,
        },
    };
}
