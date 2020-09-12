import {
    GL_ARRAY_BUFFER,
    GL_BLEND,
    GL_COLOR_BUFFER_BIT,
    GL_CW,
    GL_DEPTH_BUFFER_BIT,
    GL_DEPTH_TEST,
    GL_FLOAT,
    GL_FRAMEBUFFER,
    GL_TEXTURE0,
    GL_TEXTURE_2D,
    GL_UNSIGNED_SHORT,
} from "../../common/webgl.js";
import {CameraEye, CameraKind, CameraPerspective, CameraXr} from "../components/com_camera.js";
import {EmitParticles} from "../components/com_emit_particles.js";
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

    render_textured_diffuse(game, camera);

    // For best results, we should sort translucent entities by their distance
    // to the camera first. For our use-case skipping sorting is good enough.
    render_particles(game, camera);
}

function render_vr(game: Game, camera: CameraXr) {
    let layer = game.XrFrame!.session.renderState.baseLayer!;
    game.Gl.bindFramebuffer(GL_FRAMEBUFFER, layer.framebuffer);
    game.Gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    for (let name in camera.Eyes) {
        let eye = camera.Eyes[name];
        let viewport = layer.getViewport(eye.Viewpoint);
        game.Gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
        render_textured_diffuse(game, eye);
        render_particles(game, eye);
    }
}

function render_textured_diffuse(game: Game, eye: CameraEye) {
    let material = game.MaterialTexturedDiffuse;

    game.Gl.useProgram(material.Program);
    game.Gl.uniformMatrix4fv(material.Locations.Pv, false, eye.Pv);
    game.Gl.uniform3fv(material.Locations.EyePosition, eye.Position);
    game.Gl.uniform1f(material.Locations.FogDistance, eye.FogDistance);
    game.Gl.uniform4fv(material.Locations.LightPositions, game.LightPositions);
    game.Gl.uniform4fv(material.Locations.LightDetails, game.LightDetails);

    let current_front_face = null;

    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) === QUERY) {
            let transform = game.World.Transform[i];
            let render = game.World.Render[i];

            if (render.FrontFace !== current_front_face) {
                current_front_face = render.FrontFace;
                game.Gl.frontFace(render.FrontFace);
            }

            if (render.Material === material) {
                draw_textured_diffuse(game, transform, render as RenderTexturedDiffuse);
            }
        }
    }
}

function render_particles(game: Game, eye: CameraEye) {
    let material = game.MaterialParticles;

    game.Gl.disable(GL_DEPTH_TEST);
    game.Gl.enable(GL_BLEND);
    game.Gl.frontFace(GL_CW);

    game.Gl.useProgram(material.Program);
    game.Gl.uniformMatrix4fv(material.Locations.Pv, false, eye.Pv);

    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) === QUERY) {
            let render = game.World.Render[i];

            if (render.Material === material) {
                let emitter = game.World.EmitParticles[i];
                if (emitter.Instances.length > 0) {
                    draw_particles(game, render as RenderParticles, emitter);
                }
            }
        }
    }

    game.Gl.disable(GL_BLEND);
    game.Gl.enable(GL_DEPTH_TEST);
}

function draw_textured_diffuse(game: Game, transform: Transform, render: RenderTexturedDiffuse) {
    game.Gl.uniformMatrix4fv(render.Material.Locations.World, false, transform.World);
    game.Gl.uniformMatrix4fv(render.Material.Locations.Self, false, transform.Self);

    game.Gl.activeTexture(GL_TEXTURE0);
    game.Gl.bindTexture(GL_TEXTURE_2D, render.Texture);
    game.Gl.uniform1i(render.Material.Locations.Sampler, 0);
    game.Gl.uniform4fv(render.Material.Locations.Color, render.Color);
    game.Gl.uniform1f(render.Material.Locations.FogLevel, render.FogLevel);

    game.Gl.bindVertexArray(render.Vao);
    game.Gl.drawElements(render.Material.Mode, render.Mesh.IndexCount, GL_UNSIGNED_SHORT, 0);
    game.Gl.bindVertexArray(null);
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
