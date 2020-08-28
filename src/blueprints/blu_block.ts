import {float} from "../../common/random.js";
import {collide} from "../components/com_collide.js";
import {render_diffuse} from "../components/com_render_diffuse.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {Blueprint} from "../core.js";
import {Game, Layer} from "../game.js";

export function blueprint_block(game: Game): Blueprint {
    let c = float(0, 1);
    return {
        Using: [
            collide(true, Layer.Terrain, Layer.Player | Layer.Terrain),
            rigid_body(RigidKind.Dynamic),
            render_diffuse(game.MaterialDiffuseGouraud, game.MeshCube, [c, c, c, 1]),
        ],
    };
}
