#version 300 es

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
