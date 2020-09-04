import {RenderColoredBasic} from "./com_render_colored_basic.js";
import {RenderParticles} from "./com_render_particles.js";
import {RenderTexturedDiffuse} from "./com_render_textured_diffuse.js";
import {RenderTexturedUnlit} from "./com_render_textured_unlit.js";

export type Render =
    | RenderColoredBasic
    | RenderTexturedDiffuse
    | RenderTexturedUnlit
    | RenderParticles;

export const enum RenderKind {
    ColoredBasic,
    TexturedDiffuse,
    TexturedUnlit,
    Particles,
}

export const enum RenderPhase {
    Opaque,
    Translucent,
}
