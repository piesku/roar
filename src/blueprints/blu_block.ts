import {Vec4} from "../../common/math.js";
import {element} from "../../common/random.js";
import {collide} from "../components/com_collide.js";
import {render_diffuse} from "../components/com_render_diffuse.js";
import {rigid_body} from "../components/com_rigid_body.js";
import {Blueprint} from "../core.js";
import {Game, Layer} from "../game.js";

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
        Using: [
            collide(true, Layer.Terrain, Layer.Player | Layer.Terrain),
            rigid_body(true),
            render_diffuse(game.MaterialDiffuseGouraud, game.MeshCube, element(colors)),
        ],
    };
}
