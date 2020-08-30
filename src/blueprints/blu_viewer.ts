import {GL_CCW} from "../../common/webgl.js";
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
                        Translation: [0, -0.3, 0],
                        Children: [
                            {
                                // Flame emitter.
                                Rotation: [0, 1, 0, 0],
                                Using: [
                                    shake(Infinity, 0.05),
                                    emit_particles(5, 0, 10),
                                    render_particles([1, 1, 0, 0.3], 20, [1, 0, 0, 0.7], 100),
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
