import {float} from "../../common/random.js";
import {GL_CW} from "../../common/webgl.js";
import {aim} from "../components/com_aim.js";
import {audio_source} from "../components/com_audio_source.js";
import {control_move} from "../components/com_control_move.js";
import {lifespan} from "../components/com_lifespan.js";
import {light_point} from "../components/com_light.js";
import {move} from "../components/com_move.js";
import {render_colored_unlit} from "../components/com_render_colored_unlit.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {toggle} from "../components/com_toggle.js";
import {Blueprint} from "../core.js";
import {Game} from "../game.js";
import {snd_siren} from "../sounds/snd_siren.js";
import {Has} from "../world.js";

export function blueprint_police(game: Game): Blueprint {
    return {
        Scale: [0.03, 0.03, 0.03],
        Using: [
            control_move([0, 0, 1], null),
            aim(2), // The player's base.
            move(float(1, 3), float(2, 4)),
            audio_source(true, snd_siren()),
            lifespan(8),
        ],
        Children: [
            {
                Translation: [-0.5, 2, 0],
                Using: [
                    light_point([1, 0, 0], 2),
                    render_colored_unlit(game.MaterialColoredUnlit, game.MeshCube, [1, 1, 0, 1]),
                    toggle(Has.Light | Has.Render, 0.5, true),
                ],
            },
            {
                Translation: [0.5, 2, 0],
                Using: [
                    light_point([0, 0, 1], 2),
                    render_colored_unlit(game.MaterialColoredUnlit, game.MeshCube, [0, 1, 1, 1]),
                    toggle(Has.Light | Has.Render, 0.5, false),
                ],
            },
            {
                Translation: [0, 0.75, 0],
                Scale: [2, 1.5, 5],
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["police"],
                        GL_CW,
                        [1, 1, 1, 1],
                        -2
                    ),
                ],
            },
        ],
    };
}
