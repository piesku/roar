import {control_move} from "../components/com_control_move.js";
import {lifespan} from "../components/com_lifespan.js";
import {light_point} from "../components/com_light.js";
import {move} from "../components/com_move.js";
import {Blueprint} from "../core.js";
import {Game} from "../game.js";

export function blueprint_launch(game: Game): Blueprint {
    return {
        Using: [
            control_move([0, 0, 1], null),
            move(30, 0),
            lifespan(8),
            light_point([0.5, 0.5, 1], 100),
        ],
    };
}
