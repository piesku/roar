import {Material} from "../../common/material.js";
import {Mat4} from "../../common/math.js";
import {
    GL_ARRAY_BUFFER,
    GL_BLEND,
    GL_COLOR_BUFFER_BIT,
    GL_DEPTH_BUFFER_BIT,
    GL_DEPTH_TEST,
    GL_DYNAMIC_DRAW,
    GL_FLOAT,
    GL_FRAMEBUFFER,
    GL_TEXTURE0,
    GL_TEXTURE_2D,
    GL_UNSIGNED_SHORT,
} from "../../common/webgl.js";
import {ParticlesLayout} from "../../materials/layout_particles.js";
import {TexturedDiffuseLayout} from "../../materials/layout_textured_diffuse.js";
import {TexturedUnlitLayout} from "../../materials/layout_textured_unlit.js";
import {CameraKind, CameraPerspective, CameraXr} from "../components/com_camera.js";
import {EmitParticles} from "../components/com_emit_particles.js";
import {RenderKind, RenderPhase} from "../components/com_render.js";
import {RenderParticles} from "../components/com_render_particles.js";
import {RenderTexturedDiffuse} from "../components/com_render_textured_diffuse.js";
import {RenderTexturedUnlit} from "../components/com_render_textured_unlit.js";
import {Transform} from "../components/com_transform.js";
import {Game} from "../game.js";
import {Has} from "../world.js";
import {DATA_PER_PARTICLE} from "./sys_particles.js";

const QUERY = Has.Transform | Has.Render;

export function sys_render(game: Game, delta: number) {
    let camera = game.Camera!;
    if (camera.Kind === CameraKind.Xr) {
        render_vr(game, camera);
    } else {
        render_screen(game, camera);
    }
}

function render_screen(game: Game, camera: CameraPerspective) {
    game.Gl.bindFramebuffer(GL_FRAMEBUFFER, null);
    game.Gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    if (game.ViewportResized) {
        game.Gl.viewport(0, 0, game.ViewportWidth, game.ViewportHeight);
    }

    render(game, camera.Pv, RenderPhase.Opaque);

    // For best results, we should sort translucent entities by their distance
    // to the camera first. For our use-case skipping sorting is good enough.
    game.Gl.disable(GL_DEPTH_TEST);
    game.Gl.enable(GL_BLEND);
    render(game, camera.Pv, RenderPhase.Translucent);
    game.Gl.disable(GL_BLEND);
    game.Gl.enable(GL_DEPTH_TEST);
}

function render_vr(game: Game, camera: CameraXr) {
    let layer = game.XrFrame!.session.renderState.baseLayer!;
    game.Gl.bindFramebuffer(GL_FRAMEBUFFER, layer.framebuffer);
    game.Gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    for (let eye of camera.Eyes) {
        let viewport = layer.getViewport(eye.View);
        game.Gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
        render(game, eye.Pv, RenderPhase.Opaque);

        game.Gl.disable(GL_DEPTH_TEST);
        game.Gl.enable(GL_BLEND);
        render(game, eye.Pv, RenderPhase.Translucent);
        game.Gl.disable(GL_BLEND);
        game.Gl.enable(GL_DEPTH_TEST);
    }
}

function render(game: Game, pv: Mat4, phase: RenderPhase) {
    // Keep track of the current material to minimize switching.
    let current_material = null;
    let current_front_face = null;

    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) === QUERY) {
            let transform = game.World.Transform[i];
            let render = game.World.Render[i];

            if (render.Phase !== phase) {
                continue;
            }

            if (render.Material !== current_material) {
                current_material = render.Material;
                switch (render.Kind) {
                    case RenderKind.TexturedDiffuse:
                        use_textured_diffuse(game, render.Material, pv);
                        break;
                    case RenderKind.TexturedUnlit:
                        use_textured_unlit(game, render.Material, pv);
                        break;
                    case RenderKind.Particles:
                        use_particles(game, render.Material, pv);
                        break;
                }
            }

            if (render.FrontFace !== current_front_face) {
                current_front_face = render.FrontFace;
                game.Gl.frontFace(render.FrontFace);
            }

            switch (render.Kind) {
                case RenderKind.TexturedDiffuse:
                    draw_textured_diffuse(game, transform, render);
                    break;
                case RenderKind.TexturedUnlit:
                    draw_textured_unlit(game, transform, render);
                    break;
                case RenderKind.Particles:
                    let emitter = game.World.EmitParticles[i];
                    draw_particles(game, render, emitter);
                    break;
            }
        }
    }
}

function use_textured_diffuse(game: Game, material: Material<TexturedDiffuseLayout>, pv: Mat4) {
    game.Gl.useProgram(material.Program);
    game.Gl.uniformMatrix4fv(material.Locations.Pv, false, pv);
    game.Gl.uniform4fv(material.Locations.LightPositions, game.LightPositions);
    game.Gl.uniform4fv(material.Locations.LightDetails, game.LightDetails);
}

function draw_textured_diffuse(game: Game, transform: Transform, render: RenderTexturedDiffuse) {
    game.Gl.uniformMatrix4fv(render.Material.Locations.World, false, transform.World);
    game.Gl.uniformMatrix4fv(render.Material.Locations.Self, false, transform.Self);
    game.Gl.uniform4fv(render.Material.Locations.Color, render.Color);

    game.Gl.activeTexture(GL_TEXTURE0);
    game.Gl.bindTexture(GL_TEXTURE_2D, render.Texture);
    game.Gl.uniform1i(render.Material.Locations.Sampler, 0);
    game.Gl.uniform2fv(render.Material.Locations.TexScale, render.TexScale);

    if (render.TexOffset) {
        game.Gl.uniform2fv(render.Material.Locations.TexOffset, render.TexOffset());
    } else {
        game.Gl.uniform2fv(render.Material.Locations.TexOffset, [0, 0]);
    }

    game.Gl.bindVertexArray(render.Vao);
    game.Gl.drawElements(render.Material.Mode, render.Mesh.IndexCount, GL_UNSIGNED_SHORT, 0);
    game.Gl.bindVertexArray(null);
}

function use_textured_unlit(game: Game, material: Material<TexturedUnlitLayout>, pv: Mat4) {
    game.Gl.useProgram(material.Program);
    game.Gl.uniformMatrix4fv(material.Locations.Pv, false, pv);
}

function draw_textured_unlit(game: Game, transform: Transform, render: RenderTexturedUnlit) {
    game.Gl.uniformMatrix4fv(render.Material.Locations.World, false, transform.World);
    game.Gl.uniform4fv(render.Material.Locations.Color, render.Color);

    game.Gl.activeTexture(GL_TEXTURE0);
    game.Gl.bindTexture(GL_TEXTURE_2D, render.Texture);
    game.Gl.uniform1i(render.Material.Locations.Sampler, 0);
    game.Gl.uniform2fv(render.Material.Locations.TexScale, render.TexScale);

    if (render.TexOffset) {
        game.Gl.uniform2fv(render.Material.Locations.TexOffset, render.TexOffset());
    } else {
        game.Gl.uniform2fv(render.Material.Locations.TexOffset, [0, 0]);
    }

    game.Gl.bindVertexArray(render.Vao);
    game.Gl.drawElements(render.Material.Mode, render.Mesh.IndexCount, GL_UNSIGNED_SHORT, 0);
    game.Gl.bindVertexArray(null);
}

function use_particles(game: Game, material: Material<ParticlesLayout>, pv: Mat4) {
    game.Gl.useProgram(material.Program);
    game.Gl.uniformMatrix4fv(material.Locations.Pv, false, pv);
}

function draw_particles(game: Game, render: RenderParticles, emitter: EmitParticles) {
    game.Gl.uniform4fv(render.Material.Locations.ColorStart, render.ColorStart);
    game.Gl.uniform4fv(render.Material.Locations.ColorEnd, render.ColorEnd);
    game.Gl.activeTexture(GL_TEXTURE0);
    game.Gl.bindTexture(GL_TEXTURE_2D, render.Texture);
    game.Gl.uniform1i(render.Material.Locations.Sampler, 0);

    game.Gl.uniform4f(
        render.Material.Locations.Details,
        emitter.Lifespan,
        emitter.Speed,
        ...render.Size
    );
    game.Gl.bindBuffer(GL_ARRAY_BUFFER, render.Buffer);
    let instances = Float32Array.from(emitter.Instances);
    game.Gl.enableVertexAttribArray(render.Material.Locations.OriginAge);
    game.Gl.vertexAttribPointer(
        render.Material.Locations.OriginAge,
        4,
        GL_FLOAT,
        false,
        DATA_PER_PARTICLE * 4,
        0
    );
    game.Gl.enableVertexAttribArray(render.Material.Locations.DirectionSeed);
    game.Gl.vertexAttribPointer(
        render.Material.Locations.DirectionSeed,
        4,
        GL_FLOAT,
        false,
        DATA_PER_PARTICLE * 4,
        4 * 4
    );
    game.Gl.bufferData(GL_ARRAY_BUFFER, instances, GL_DYNAMIC_DRAW);
    game.Gl.drawArrays(render.Material.Mode, 0, emitter.Instances.length / DATA_PER_PARTICLE);
}
