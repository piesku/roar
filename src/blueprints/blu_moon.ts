import {from_euler} from "../../common/quat.js";
import {control_move} from "../components/com_control_move.js";
import {light_point} from "../components/com_light.js";
import {move} from "../components/com_move.js";
import {Blueprint} from "../core.js";

export function blueprint_moon(): Blueprint {
    return {
        Rotation: from_euler([0, 0, 0, 0], 0, -135, 0),
        Using: [control_move(null, [0, 1, 0, 0]), move(0, 0.01)],
        Children: [
            {
                Translation: [0, 10, -10],
                Using: [light_point([1, 1, 1], 14)],
            },
        ],
    };
}
