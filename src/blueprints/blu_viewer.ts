import {GL_CCW} from "../../common/webgl.js";
import {camera_xr} from "../components/com_camera.js";
import {collide} from "../components/com_collide.js";
import {control_xr} from "../components/com_control_xr.js";
import {render_diffuse} from "../components/com_render_diffuse.js";
import {rigid_body} from "../components/com_rigid_body.js";
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
                        Translation: [0, -0.2, 0],
                        Scale: [0.4, 0.2, 5],
                        Using: [
                            render_diffuse(game.MaterialDiffuseGouraud, game.MeshCube, [
                                1,
                                1,
                                0.3,
                                1,
                            ]),
                        ],
                    },
                ],
            },
            {
                // Left hand.
                Using: [
                    control_xr("left"),
                    collide(true, Layer.Player, Layer.None, [0.1, 0.1, 0.1]),
                    rigid_body(false),
                ],
                Children: [
                    {
                        Scale: [-1, 1, 1],
                        Using: [
                            render_diffuse(
                                game.MaterialDiffuseGouraud,
                                game.MeshHand,
                                [1, 1, 0.3, 1],
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
                    collide(true, Layer.Player, Layer.None, [0.1, 0.1, 0.1]),
                    rigid_body(false),
                ],
                Children: [
                    {
                        Using: [
                            render_diffuse(game.MaterialDiffuseGouraud, game.MeshHand, [
                                1,
                                1,
                                0.3,
                                1,
                            ]),
                        ],
                    },
                ],
            },
        ],
    };
}
