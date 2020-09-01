import {Quat} from "../../common/math.js";
import {element, float} from "../../common/random.js";
import {audio_source} from "../components/com_audio_source.js";
import {control_move} from "../components/com_control_move.js";
import {lifespan} from "../components/com_lifespan.js";
import {light_point} from "../components/com_light.js";
import {move} from "../components/com_move.js";
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
        Using: [
            control_move([0, 0, 1], element(rotations)),
            move(float(1, 3), float(0, 0.3)),
            audio_source(snd_siren),
            lifespan(8),
        ],
        Children: [
            {
                Translation: [-0.3, 0, 0],
                Using: [light_point([1, 0, 0], 1), toggle(Has.Light, 0.5, true)],
            },
            {
                Translation: [0.3, 0, 0],
                Using: [light_point([0, 0, 1], 1), toggle(Has.Light, 0.5, false)],
            },
        ],
    };
}
