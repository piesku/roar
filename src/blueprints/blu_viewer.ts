import {GL_CCW} from "../../common/webgl.js";
import {audio_source} from "../components/com_audio_source.js";
import {camera_xr} from "../components/com_camera.js";
import {collide} from "../components/com_collide.js";
import {control_xr} from "../components/com_control_xr.js";
import {emit_particles} from "../components/com_emit_particles.js";
import {render_particles} from "../components/com_render_particles.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {shake} from "../components/com_shake.js";
import {Blueprint} from "../core.js";
import {Game, Layer} from "../game.js";

export function blueprint_viewer(game: Game): Blueprint {
    return {
        Children: [
            {
                // Headset camera.
                Using: [camera_xr()],
            },
            {
                // Head.
                Using: [control_xr("head")],
                Children: [
                    {
                        // Mouth.
                        Translation: [0, -0.2, 0],
                        Rotation: [0, 1, 0, 0],
                        Using: [audio_source()],
                        Children: [
                            {
                                // Flame emitter.
                                Using: [
                                    shake(Infinity, 0.05),
                                    emit_particles(1, 0.01, 15),
                                    render_particles(
                                        game.Textures["fire"],
                                        [0.8, 0.4, 0, 0.2],
                                        150,
                                        [1, 0, 0, 0],
                                        200
                                    ),
                                ],
                            },
                            {
                                // Flame emitter.
                                Using: [
                                    shake(Infinity, 0.1),
                                    emit_particles(1.5, 0.01, 13),
                                    render_particles(
                                        game.Textures["fire"],
                                        [0.8, 0.4, 0, 0.2],
                                        150,
                                        [1, 0, 0, 0],
                                        200
                                    ),
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                // Left hand.
                Using: [
                    control_xr("left"),
                    collide(true, Layer.Player, Layer.None, [0.05, 0.15, 0.15]),
                    rigid_body(RigidKind.Kinematic),
                ],
                Children: [
                    {
                        Scale: [-1, 1, 1],
                        Using: [
                            render_textured_diffuse(
                                game.MaterialTexturedDiffuse,
                                game.MeshHand,
                                game.Textures["claws"],
                                GL_CCW
                            ),
                        ],
                    },
                ],
            },
            {
                // Right hand.
                Using: [
                    control_xr("right"),
                    collide(true, Layer.Player, Layer.None, [0.05, 0.15, 0.15]),
                    rigid_body(RigidKind.Kinematic),
                ],
                Children: [
                    {
                        Using: [
                            render_textured_diffuse(
                                game.MaterialTexturedDiffuse,
                                game.MeshHand,
                                game.Textures["claws"]
                            ),
                        ],
                    },
                ],
            },
        ],
    };
}
