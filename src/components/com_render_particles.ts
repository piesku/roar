import {Material} from "../../common/material.js";
import {Vec3, Vec4} from "../../common/math.js";
import {GL_CW} from "../../common/webgl.js";
import {ParticlesLayout} from "../../materials/layout_particles.js";
import {Entity, Game} from "../game.js";
import {Has} from "../world.js";
import {RenderKind, RenderPhase} from "./com_render.js";

export interface RenderParticles {
    readonly Kind: RenderKind.Particles;
    readonly Phase: RenderPhase;
    readonly Material: Material<ParticlesLayout>;
    readonly Buffer: WebGLBuffer;
    readonly ColorSizeStart: Vec4;
    readonly ColorSizeEnd: Vec4;
    readonly FrontFace: GLenum;
}

export function render_particles(
    start_color: Vec3,
    start_size: number,
    end_color: Vec3,
    end_size: number
) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.Render;
        game.World.Render[entity] = {
            Kind: RenderKind.Particles,
            Phase: RenderPhase.Opaque,
            Material: game.MaterialParticles,
            Buffer: game.Gl.createBuffer()!,
            ColorSizeStart: <Vec4>[...start_color, start_size],
            ColorSizeEnd: <Vec4>[...end_color, end_size],
            FrontFace: GL_CW,
        };
    };
}
