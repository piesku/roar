import {RenderColoredDiffuse} from "./com_render_colored_diffuse.js";
import {RenderTexturedDiffuse} from "./com_render_textured_diffuse.js";

export type Render = RenderColoredDiffuse | RenderTexturedDiffuse;

export const enum RenderKind {
    ColoredDiffuse,
    TexturedDiffuse,
}
