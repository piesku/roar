#version 300 es

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
