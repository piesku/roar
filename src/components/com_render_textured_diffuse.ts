import {Material, Mesh} from "../../common/material.js";
import {Vec2, Vec4} from "../../common/math.js";
import {GL_ARRAY_BUFFER, GL_CW, GL_ELEMENT_ARRAY_BUFFER, GL_FLOAT} from "../../common/webgl.js";
import {TexturedDiffuseLayout} from "../../materials/layout_textured_diffuse.js";
import {Entity, Game} from "../game.js";
import {Has} from "../world.js";
import {RenderKind, RenderPhase} from "./com_render.js";

export interface RenderTexturedDiffuse {
    readonly Kind: RenderKind.TexturedDiffuse;
    readonly Phase: RenderPhase;
    readonly Material: Material<TexturedDiffuseLayout>;
    readonly Mesh: Mesh;
    readonly FrontFace: GLenum;
    readonly Vao: WebGLVertexArrayObject;
    Color: Vec4;
    FogLevel: number;
    Texture: WebGLTexture;
    TexScale: Vec2;
    TexOffset?: () => Vec2;
}

let vaos: WeakMap<Mesh, WebGLVertexArrayObject> = new WeakMap();

export function render_textured_diffuse(
    material: Material<TexturedDiffuseLayout>,
    mesh: Mesh,
    texture: WebGLTexture,
    front_face: GLenum = GL_CW,
    color: Vec4 = [1, 1, 1, 1],
    texture_scale: Vec2 = [1, 1],
    texture_offset?: () => Vec2,
    fog_level = -0.2
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

            game.Gl.bindBuffer(GL_ARRAY_BUFFER, mesh.TexCoordBuffer);
            game.Gl.enableVertexAttribArray(material.Locations.VertexTexCoord);
            game.Gl.vertexAttribPointer(
                material.Locations.VertexTexCoord,
                2,
                GL_FLOAT,
                false,
                0,
                0
            );

            game.Gl.bindBuffer(GL_ARRAY_BUFFER, mesh.NormalBuffer);
            game.Gl.enableVertexAttribArray(material.Locations.VertexNormal);
            game.Gl.vertexAttribPointer(material.Locations.VertexNormal, 3, GL_FLOAT, false, 0, 0);

            game.Gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, mesh.IndexBuffer);

            game.Gl.bindVertexArray(null);
            vaos.set(mesh, vao);
        }

        game.World.Signature[entity] |= Has.Render;
        game.World.Render[entity] = {
            Kind: RenderKind.TexturedDiffuse,
            Phase: color[3] < 1 ? RenderPhase.Translucent : RenderPhase.Opaque,
            Material: material,
            Mesh: mesh,
            FrontFace: front_face,
            Vao: vaos.get(mesh)!,
            Color: color,
            FogLevel: fog_level,
            Texture: texture,
            TexScale: texture_scale,
            TexOffset: texture_offset,
        };
    };
}
