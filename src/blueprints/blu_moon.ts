import {GL_CW} from "../../common/webgl.js";
import {control_rotate} from "../components/com_control_rotate.js";
import {light_point} from "../components/com_light.js";
import {move} from "../components/com_move.js";
import {render_textured_unlit} from "../components/com_render_textured_unlit.js";
import {Blueprint} from "../core.js";
import {Game} from "../game.js";

export function blueprint_moon(game: Game): Blueprint {
    return {
        Using: [control_rotate([0, 1, 0, 0]), move(0, 0.01)],
        Children: [
            {
                Translation: [0, 10, 10],
                Using: [light_point([1, 1, 1], 14)],
            },
            {
                Translation: [0, 100, 100],
                // Y 45°
                Rotation: [0, 0.3826834, 0, 0.9238795],
                Scale: [20, 20, 20],
                Using: [
                    render_textured_unlit(
                        game.MaterialTexturedUnlit,
                        game.MeshCube,
                        game.Textures["noise"],
                        GL_CW,
                        [2, 2, 2, 1]
                    ),
                ],
            },
        ],
    };
}