import {RenderColoredUnlit} from "./com_render_colored_unlit.js";
import {RenderParticles} from "./com_render_particles.js";
import {RenderTexturedDiffuse} from "./com_render_textured_diffuse.js";

export type Render = RenderColoredUnlit | RenderTexturedDiffuse | RenderParticles;

export const enum RenderKind {
    ColoredUnlit,
    TexturedDiffuse,
    Particles,
}

export const enum RenderPhase {
    Opaque,
    Translucent,
}
