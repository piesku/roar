import {from_euler} from "../../common/quat.js";
import {collide} from "../components/com_collide.js";
import {render_colored_diffuse} from "../components/com_render_colored_diffuse.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {Blueprint} from "../core.js";
import {Game, Layer} from "../game.js";

export function blueprint_star(game: Game, c: number): Blueprint {
    return {
        Using: [
            collide(true, Layer.Terrain, Layer.Player | Layer.Terrain),
            rigid_body(RigidKind.Dynamic),
            render_colored_diffuse(game.MaterialDiffuseToon, game.MeshCube, [c, c, c, 1]),
        ],
        Children: [
            {
                Rotation: from_euler([0, 0, 0, 0], 0, 45, 0),
                Using: [
                    render_colored_diffuse(game.MaterialDiffuseToon, game.MeshCube, [c, c, c, 1]),
                ],
            },
        ],
    };
}
