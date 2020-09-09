import {Material} from "../../common/material.js";
import {
    GL_ARRAY_BUFFER,
    GL_BLEND,
    GL_COLOR_BUFFER_BIT,
    GL_DEPTH_BUFFER_BIT,
    GL_DEPTH_TEST,
    GL_FLOAT,
    GL_FRAMEBUFFER,
    GL_TEXTURE0,
    GL_TEXTURE_2D,
    GL_UNSIGNED_SHORT,
} from "../../common/webgl.js";
import {ColoredUnlitLayout} from "../../materials/layout_colored_unlit.js";
import {ParticlesLayout} from "../../materials/layout_particles.js";
import {TexturedDiffuseLayout} from "../../materials/layout_textured_diffuse.js";
import {CameraEye, CameraKind, CameraPerspective, CameraXr} from "../components/com_camera.js";
import {EmitParticles} from "../components/com_emit_particles.js";
import {RenderKind, RenderPhase} from "../components/com_render.js";
import {RenderColoredUnlit} from "../components/com_render_colored_unlit.js";
import {DATA_PER_PARTICLE, RenderParticles} from "../components/com_render_particles.js";
import {RenderTexturedDiffuse} from "../components/com_render_textured_diffuse.js";
import {Transform} from "../components/com_transform.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

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

    render(game, camera, RenderPhase.Opaque);

    // For best results, we should sort translucent entities by their distance
    // to the camera first. For our use-case skipping sorting is good enough.
    game.Gl.disable(GL_DEPTH_TEST);
    game.Gl.enable(GL_BLEND);
    render(game, camera, RenderPhase.Translucent);
    game.Gl.disable(GL_BLEND);
    game.Gl.enable(GL_DEPTH_TEST);
}

function render_vr(game: Game, camera: CameraXr) {
    let layer = game.XrFrame!.session.renderState.baseLayer!;
    game.Gl.bindFramebuffer(GL_FRAMEBUFFER, layer.framebuffer);
    game.Gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    for (let name in camera.Eyes) {
        let eye = camera.Eyes[name];
        let viewport = layer.getViewport(eye.Viewpoint);
        game.Gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
        render(game, eye, RenderPhase.Opaque);

        game.Gl.disable(GL_DEPTH_TEST);
        game.Gl.enable(GL_BLEND);
        render(game, eye, RenderPhase.Translucent);
        game.Gl.disable(GL_BLEND);
        game.Gl.enable(GL_DEPTH_TEST);
    }
}

function render(game: Game, eye: CameraEye, phase: RenderPhase) {
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
                    case RenderKind.ColoredUnlit:
                        use_colored_unlit(game, render.Material, eye);
                        break;
                    case RenderKind.TexturedDiffuse:
                        use_textured_diffuse(game, render.Material, eye);
                        break;
                    case RenderKind.Particles:
                        use_particles(game, render.Material, eye);
                        break;
                }
            }

            if (render.FrontFace !== current_front_face) {
                current_front_face = render.FrontFace;
                game.Gl.frontFace(render.FrontFace);
            }

            switch (render.Kind) {
                case RenderKind.ColoredUnlit:
                    draw_colored_unlit(game, transform, render);
                    break;
                case RenderKind.TexturedDiffuse:
                    draw_textured_diffuse(game, transform, render);
                    break;
                case RenderKind.Particles:
                    let emitter = game.World.EmitParticles[i];
                    draw_particles(game, render, emitter);
                    break;
            }
        }
    }
}

function use_colored_unlit(game: Game, material: Material<ColoredUnlitLayout>, eye: CameraEye) {
    game.Gl.useProgram(material.Program);
    game.Gl.uniformMatrix4fv(material.Locations.Pv, false, eye.Pv);
}

function draw_colored_unlit(game: Game, transform: Transform, render: RenderColoredUnlit) {
    game.Gl.uniformMatrix4fv(render.Material.Locations.World, false, transform.World);
    game.Gl.uniform4fv(render.Material.Locations.Color, render.Color);
    game.Gl.bindVertexArray(render.Vao);
    game.Gl.drawElements(render.Material.Mode, render.Mesh.IndexCount, GL_UNSIGNED_SHORT, 0);
    game.Gl.bindVertexArray(null);
}

function use_textured_diffuse(
    game: Game,
    material: Material<TexturedDiffuseLayout>,
    eye: CameraEye
) {
    game.Gl.useProgram(material.Program);
    game.Gl.uniformMatrix4fv(material.Locations.Pv, false, eye.Pv);
    game.Gl.uniform3fv(material.Locations.EyePosition, eye.Position);
    game.Gl.uniform1f(material.Locations.FogDistance, eye.FogDistance);
    game.Gl.uniform4fv(material.Locations.LightPositions, game.LightPositions);
    game.Gl.uniform4fv(material.Locations.LightDetails, game.LightDetails);
}

function draw_textured_diffuse(game: Game, transform: Transform, render: RenderTexturedDiffuse) {
    game.Gl.uniformMatrix4fv(render.Material.Locations.World, false, transform.World);
    game.Gl.uniformMatrix4fv(render.Material.Locations.Self, false, transform.Self);
    game.Gl.uniform4fv(render.Material.Locations.Color, render.Color);
    game.Gl.uniform1f(render.Material.Locations.FogLevel, render.FogLevel);

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

function use_particles(game: Game, material: Material<ParticlesLayout>, eye: CameraEye) {
    game.Gl.useProgram(material.Program);
    game.Gl.uniformMatrix4fv(material.Locations.Pv, false, eye.Pv);
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

    let instances = Float32Array.from(emitter.Instances);
    game.Gl.bindBuffer(GL_ARRAY_BUFFER, render.Buffer);
    game.Gl.bufferSubData(GL_ARRAY_BUFFER, 0, instances);

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
    game.Gl.drawArrays(render.Material.Mode, 0, emitter.Instances.length / DATA_PER_PARTICLE);
}
