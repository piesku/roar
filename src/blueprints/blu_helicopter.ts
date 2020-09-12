import {from_euler} from "../../common/quat.js";
import {float} from "../../common/random.js";
import {aim} from "../components/com_aim.js";
import {audio_source} from "../components/com_audio_source.js";
import {control_move} from "../components/com_control_move.js";
import {lifespan} from "../components/com_lifespan.js";
import {light_point} from "../components/com_light.js";
import {move} from "../components/com_move.js";
import {find_first} from "../components/com_named.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {Blueprint} from "../core.js";
import {Game} from "../game.js";
import {snd_helicopter} from "../sounds/snd_helicopter.js";

export function blueprint_helicopter(game: Game): Blueprint {
    return {
        Scale: [0.03, 0.03, 0.03],
        Using: [
            control_move([0, 0, 1], null),
            aim(find_first(game.World, "head")),
            move(float(2, 4), float(1, 3)),
            audio_source(true, snd_helicopter),
            lifespan(8),
        ],
        Children: [
            {
                // Searchlight.
                Translation: [0, -3, 3],
                Using: [light_point([1, 1, 1], 2)],
            },
            {
                // Body.
                Scale: [2, 3, 4],
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["police"]
                    ),
                ],
            },
            {
                // Rotor.
                Translation: [0, 2, 0],
                Scale: [8, 0.1, 1],
                Using: [
                    control_move(null, [0, 1, 0, 0]),
                    move(0, 20),
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["noise"],
                        [0.1, 0.1, 0.1, 1]
                    ),
                ],
            },
            {
                // Tail.
                Translation: [0, 0, -4],
                Rotation: from_euler([0, 0, 0, 0], 10, 0, 0),
                Scale: [1, 1.5, 4],
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["police"]
                    ),
                ],
            },
        ],
    };
}
