#version 300 es

precision mediump float;

// See Game.LightPositions and Game.LightDetails.
const int MAX_LIGHTS = 8;

uniform vec4 color;
uniform vec3 eye_pos;
uniform float fog_distance;
uniform float fog_level;
uniform sampler2D sampler;
// [x, y, z, w: kind]
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

        vec3 light_dir = light_positions[i].xyz - vert_pos.xyz;
        float light_dist = length(light_dir);
        vec3 light_normal = light_dir / light_dist;
        // Distance attenuation.
        light_intensity /= (light_dist * light_dist);

        float diffuse_factor = dot(frag_normal, light_normal);
        if (diffuse_factor > 0.0) {
            // Diffuse color.
            rgb += color.rgb * light_color * posterize(diffuse_factor * light_intensity);
        }
    }

    vec4 tex_color = texture(sampler, vert_texcoord);
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
