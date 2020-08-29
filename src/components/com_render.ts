import {RenderTexturedDiffuse} from "./com_render_textured_diffuse.js";
import {RenderTexturedUnlit} from "./com_render_textured_unlit.js";

export type Render = RenderTexturedDiffuse | RenderTexturedUnlit;

export const enum RenderKind {
    TexturedDiffuse,
    TexturedUnlit,
}
