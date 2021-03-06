import {Material} from "../../common/material.js";
import {Vec2, Vec4} from "../../common/math.js";
import {GL_ARRAY_BUFFER, GL_CW, GL_DYNAMIC_DRAW} from "../../common/webgl.js";
import {ParticlesLayout} from "../../materials/layout_particles.js";
import {Entity, Game} from "../game.js";
import {Has} from "../world.js";
import {RenderKind, RenderPhase} from "./com_render.js";

export const DATA_PER_PARTICLE = 8;
export const MAX_PARTICLES = 200;

export interface RenderParticles {
    readonly Kind: RenderKind.Particles;
    readonly Phase: RenderPhase;
    readonly Material: Material<ParticlesLayout>;
    readonly Buffer: WebGLBuffer;
    readonly Texture: WebGLTexture;
    readonly ColorStart: Vec4;
    readonly ColorEnd: Vec4;
    readonly Size: Vec2;
    readonly FrontFace: GLenum;
}

export function render_particles(
    texture: WebGLTexture,
    start_color: Vec4,
    start_size: number,
    end_color: Vec4,
    end_size: number
) {
    return (game: Game, entity: Entity) => {
        let buffer = game.Gl.createBuffer()!;
        game.Gl.bindBuffer(GL_ARRAY_BUFFER, buffer);
        game.Gl.bufferData(GL_ARRAY_BUFFER, MAX_PARTICLES * DATA_PER_PARTICLE * 4, GL_DYNAMIC_DRAW);

        game.World.Signature[entity] |= Has.Render;
        game.World.Render[entity] = {
            Kind: RenderKind.Particles,
            Phase: RenderPhase.Translucent,
            Material: game.MaterialParticles,
            Buffer: buffer,
            Texture: texture,
            ColorStart: start_color,
            ColorEnd: end_color,
            Size: [start_size, end_size],
            FrontFace: GL_CW,
        };
    };
}
