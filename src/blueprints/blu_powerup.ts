import {from_euler} from "../../common/quat.js";
import {GL_CW} from "../../common/webgl.js";
import {control_move} from "../components/com_control_move.js";
import {emit_particles} from "../components/com_emit_particles.js";
import {move} from "../components/com_move.js";
import {render_particles} from "../components/com_render_particles.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {shake} from "../components/com_shake.js";
import {Blueprint} from "../core.js";
import {Game} from "../game.js";

export function blueprint_powerup(game: Game): Blueprint {
    return {
        Scale: [0.3, 0.3, 0.3],
        Children: [
            {
                Rotation: from_euler([0, 0, 0, 0], 45, 0, 35),
                Using: [
                    control_move(null, [0, 1, 0, 0]),
                    move(0, 1),
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["fire"],
                        GL_CW,
                        [1, 0.5, 0, 1]
                    ),
                ],
            },
            {
                Offset: 1000,
                Translation: [0, 0, 0.5],
                Rotation: from_euler([0, 0, 0, 0], -90, 0, 0),
                Using: [
                    shake(Infinity, 0.5),
                    emit_particles(1, 0.1, 1, true),
                    render_particles(game.Textures["fire"], [1, 0.5, 0, 1], 10, [1, 0, 0, 1], 10),
                ],
            },
        ],
    };
}
