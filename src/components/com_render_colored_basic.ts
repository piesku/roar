import {Material, Mesh} from "../../common/material.js";
import {Vec4} from "../../common/math.js";
import {GL_ARRAY_BUFFER, GL_CW, GL_ELEMENT_ARRAY_BUFFER, GL_FLOAT} from "../../common/webgl.js";
import {ColoredBasicLayout} from "../../materials/layout_colored_basic.js";
import {Entity, Game} from "../game.js";
import {Has} from "../world.js";
import {RenderKind, RenderPhase} from "./com_render.js";

export interface RenderColoredBasic {
    readonly Kind: RenderKind.ColoredBasic;
    readonly Phase: RenderPhase;
    readonly Material: Material<ColoredBasicLayout>;
    readonly Mesh: Mesh;
    readonly FrontFace: GLenum;
    readonly Vao: WebGLVertexArrayObject;
    Color: Vec4;
}

let vaos: WeakMap<Mesh, WebGLVertexArrayObject> = new WeakMap();

export function render_colored_basic(
    material: Material<ColoredBasicLayout>,
    mesh: Mesh,
    color: Vec4
) {
    return (game: Game, entity: Entity) => {
        if (!vaos.has(mesh)) {
            // We only need to create the VAO once.
            let vao = game.Gl.createVertexArray()!;
            game.Gl.bindVertexArray(vao);

            game.Gl.bindBuffer(GL_ARRAY_BUFFER, mesh.VertexBuffer);
            game.Gl.enableVertexAttribArray(material.Locations.VertexPosition);
            game.Gl.vertexAttribPointer(
                material.Locations.VertexPosition,
                3,
                GL_FLOAT,
                false,
                0,
                0
            );

            game.Gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, mesh.IndexBuffer);

            game.Gl.bindVertexArray(null);
            vaos.set(mesh, vao);
        }

        game.World.Signature[entity] |= Has.Render;
        game.World.Render[entity] = {
            Kind: RenderKind.ColoredBasic,
            Phase: RenderPhase.Opaque,
            Material: material,
            Mesh: mesh,
            FrontFace: GL_CW,
            Vao: vaos.get(mesh)!,
            Color: color,
        };
    };
}
