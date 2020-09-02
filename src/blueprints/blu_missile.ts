import {from_euler} from "../../common/quat.js";
import {float} from "../../common/random.js";
import {audio_source} from "../components/com_audio_source.js";
import {control_move} from "../components/com_control_move.js";
import {emit_particles} from "../components/com_emit_particles.js";
import {lifespan} from "../components/com_lifespan.js";
import {light_point} from "../components/com_light.js";
import {move} from "../components/com_move.js";
import {render_particles} from "../components/com_render_particles.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {shake} from "../components/com_shake.js";
import {Blueprint} from "../core.js";
import {Game} from "../game.js";
import {snd_missile} from "../sounds/snd_missile.js";

export function blueprint_missile(game: Game): Blueprint {
    return {
        Using: [
            control_move([0, 0, 1], null),
            move(float(4, 5), 0),
            lifespan(9),
            audio_source(true, snd_missile),
        ],
        Children: [
            {
                // Body.
                Rotation: from_euler([0, 0, 0, 0], 90, 0, 0),
                Scale: [0.1, 1, 0.1],
                Using: [
                    control_move(null, [0, 0, 1, 0]),
                    move(0, 5),
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["missile"]
                    ),
                ],
            },
            {
                // Jet.
                Translation: [0, 0, -0.5],
                Scale: [0.1, 0.1, 0.1],
                Using: [light_point([0.5, 0.5, 1], 1)],
                Children: [
                    {
                        // Jet exhaust.
                        Rotation: [0, 1, 0, 0],
                        Using: [
                            shake(Infinity, 0.02),
                            emit_particles(1, 0.01, 10, true),
                            render_particles(
                                game.Textures["fire"],
                                [0.8, 0.8, 1, 0.3],
                                50,
                                [0, 0, 1, 0],
                                10
                            ),
                        ],
                    },
                ],
            },
        ],
    };
}
