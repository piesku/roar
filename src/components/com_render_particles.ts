import {Material} from "../../common/material.js";
import {Vec2, Vec4} from "../../common/math.js";
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
    readonly ColorStart: Vec4;
    readonly ColorEnd: Vec4;
    readonly Size: Vec2;
    readonly FrontFace: GLenum;
}

export function render_particles(
    start_color: Vec4,
    start_size: number,
    end_color: Vec4,
    end_size: number
) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.Render;
        game.World.Render[entity] = {
            Kind: RenderKind.Particles,
            Phase: RenderPhase.Translucent,
            Material: game.MaterialParticles,
            Buffer: game.Gl.createBuffer()!,
            ColorStart: start_color,
            ColorEnd: end_color,
            Size: [start_size, end_size],
            FrontFace: GL_CW,
        };
    };
}
