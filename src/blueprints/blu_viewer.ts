import {GL_CCW, GL_CW} from "../../common/webgl.js";
import {camera_xr} from "../components/com_camera.js";
import {collide} from "../components/com_collide.js";
import {control_rotate} from "../components/com_control_rotate.js";
import {control_xr} from "../components/com_control_xr.js";
import {move} from "../components/com_move.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {render_textured_unlit} from "../components/com_render_textured_unlit.js";
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
                        // Flame.
                        Translation: [0, -0.3, 0],
                        Scale: [1, 0.1, 10],
                        Children: [
                            {
                                Using: [
                                    control_rotate([-0.995, 0.0995, 0, 0]),
                                    move(0, 5),
                                    shake(Infinity, 0.05),
                                    render_textured_unlit(
                                        game.MaterialTexturedUnlit,
                                        game.MeshCube,
                                        game.Textures["fire"],
                                        GL_CW,
                                        [1, 1, 1, 1],
                                        [10, 10]
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
