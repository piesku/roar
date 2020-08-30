import {RenderParticles} from "./com_render_particles.js";
import {RenderTexturedDiffuse} from "./com_render_textured_diffuse.js";
import {RenderTexturedUnlit} from "./com_render_textured_unlit.js";

export type Render = RenderTexturedDiffuse | RenderTexturedUnlit | RenderParticles;

export const enum RenderKind {
    TexturedDiffuse,
    TexturedUnlit,
    Particles,
}

export const enum RenderPhase {
    Opaque,
    Translucent,
}
