import {GL_CCW} from "../../common/webgl.js";
import {audio_listener} from "../components/com_audio_listener.js";
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

export function blueprint_viewer(game: Game, scale: number): Blueprint {
    return {
        Scale: [scale, scale, scale],
        Children: [
            {
                // Headset camera.
                Using: [camera_xr()],
            },
            {
                // Head.
                Using: [control_xr("head"), audio_listener()],
                Children: [
                    {
                        // Mouth.
                        Translation: [0, -0.2, 0],
                        Rotation: [0, 1, 0, 0],
                        Using: [audio_source(false)],
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
                Using: [control_xr("left")],
                Children: [
                    {
                        // Hand mesh.
                        Scale: [-1, 1, 1],
                        Using: [
                            collide(true, Layer.Player, Layer.None, [0.1, 0.1, 0.1]),
                            rigid_body(RigidKind.Kinematic),
                            render_textured_diffuse(
                                game.MaterialTexturedDiffuse,
                                game.MeshHand,
                                game.Textures["claws"],
                                GL_CCW
                            ),
                        ],
                    },
                    {
                        // Grip detector.
                        Translation: [0.1, 0, 0],
                        Using: [
                            collide(true, Layer.None, Layer.Building, [0.1, 0.1, 0.1]),
                            rigid_body(RigidKind.Kinematic),
                        ],
                    },
                    {
                        // Grip anchor.
                        Scale: [1 / scale, 1 / scale, 1 / scale],
                    },
                ],
            },
            {
                // Right hand.
                Using: [control_xr("right")],
                Children: [
                    {
                        // Hand mesh.
                        Using: [
                            collide(true, Layer.Player, Layer.None, [0.1, 0.1, 0.1]),
                            rigid_body(RigidKind.Kinematic),
                            render_textured_diffuse(
                                game.MaterialTexturedDiffuse,
                                game.MeshHand,
                                game.Textures["claws"]
                            ),
                        ],
                    },
                    {
                        // Grip detector.
                        Translation: [-0.1, 0, 0],
                        Using: [
                            collide(true, Layer.None, Layer.Building, [0.1, 0.1, 0.1]),
                            rigid_body(RigidKind.Kinematic),
                        ],
                    },
                    {
                        // Grip anchor.
                        Scale: [1 / scale, 1 / scale, 1 / scale],
                    },
                ],
            },
        ],
    };
}
