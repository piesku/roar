import {control_rotate} from "../components/com_control_rotate.js";
import {light_point} from "../components/com_light.js";
import {move} from "../components/com_move.js";
import {Blueprint} from "../core.js";

export function blueprint_moon(): Blueprint {
    return {
        Translation: [0, 10, 0],
        Using: [control_rotate([0, 1, 0, 0]), move(0, 0.1)],
        Children: [
            {
                Translation: [0, 0, 1],
                Using: [light_point([1, 1, 1], 8)],
            },
        ],
    };
}
