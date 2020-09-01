import {Quat} from "../../common/math.js";
import {element, float} from "../../common/random.js";
import {GL_CW} from "../../common/webgl.js";
import {audio_source} from "../components/com_audio_source.js";
import {control_move} from "../components/com_control_move.js";
import {lifespan} from "../components/com_lifespan.js";
import {light_point} from "../components/com_light.js";
import {move} from "../components/com_move.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {render_textured_unlit} from "../components/com_render_textured_unlit.js";
import {toggle} from "../components/com_toggle.js";
import {Blueprint} from "../core.js";
import {Game} from "../game.js";
import {snd_siren} from "../sounds/snd_siren.js";
import {Has} from "../world.js";

let rotations: Array<Quat> = [
    [0, 0, 0, 1],
    [0, 1, 0, 0],
    [0, -1, 0, 0],
];

export function blueprint_police(game: Game): Blueprint {
    return {
        Scale: [0.05, 0.05, 0.05],
        Using: [
            control_move([0, 0, 1], element(rotations)),
            move(float(1, 3), float(0, 0.3)),
            audio_source(snd_siren),
            lifespan(8),
        ],
        Children: [
            {
                Translation: [-1, 1.5, 0],
                Using: [
                    light_point([1, 0, 0], 1),
                    render_textured_unlit(
                        game.MaterialTexturedUnlit,
                        game.MeshCube,
                        game.Textures["one"],
                        GL_CW,
                        [1, 0, 0, 1]
                    ),
                    toggle(Has.Light | Has.Render, 0.5, true),
                ],
            },
            {
                Translation: [1, 1.5, 0],
                Using: [
                    light_point([0, 0, 1], 1),
                    render_textured_unlit(
                        game.MaterialTexturedUnlit,
                        game.MeshCube,
                        game.Textures["one"],
                        GL_CW,
                        [0, 0, 1, 1]
                    ),
                    toggle(Has.Light | Has.Render, 0.5, false),
                ],
            },
            {
                Scale: [2.5, 2, 5],
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
