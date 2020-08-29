import {RenderColoredDiffuse} from "./com_render_colored_diffuse.js";
import {RenderTexturedDiffuse} from "./com_render_textured_diffuse.js";
import {RenderTexturedUnlit} from "./com_render_textured_unlit.js";

export type Render = RenderColoredDiffuse | RenderTexturedDiffuse | RenderTexturedUnlit;

export const enum RenderKind {
    ColoredDiffuse,
    TexturedDiffuse,
    TexturedUnlit,
}
