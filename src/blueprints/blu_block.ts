import {Vec4} from "../../common/math.js";
import {element} from "../../common/random.js";
import {render_diffuse} from "../components/com_render_diffuse.js";
import {Blueprint} from "../core.js";
import {Game} from "../game.js";

const colors: Array<Vec4> = [
    [1, 0, 0, 1],
    [1, 1, 0, 1],
    [1, 0, 1, 1],
    [0, 1, 0, 1],
    [0, 1, 1, 1],
    [0, 0, 1, 1],
];

export function blueprint_block(game: Game): Blueprint {
    return {
        Using: [render_diffuse(game.MaterialDiffuseGouraud, game.MeshCube, element(colors))],
    };
}
