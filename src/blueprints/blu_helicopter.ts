import {float} from "../../common/random.js";
import {audio_source} from "../components/com_audio_source.js";
import {control_move} from "../components/com_control_move.js";
import {lifespan} from "../components/com_lifespan.js";
import {move} from "../components/com_move.js";
import {Blueprint} from "../core.js";
import {Game} from "../game.js";
import {snd_helicopter} from "../sounds/snd_helicopter.js";

export function blueprint_helicopter(game: Game): Blueprint {
    return {
        Scale: [0.05, 0.05, 0.05],
        Using: [
            control_move([0, 0, 1], null),
            move(float(3, 5), 0),
            audio_source(true, snd_helicopter),
            lifespan(8),
        ],
    };
}
