#version 300 es

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
