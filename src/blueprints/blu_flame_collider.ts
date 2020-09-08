import {Action} from "../actions.js";
import {collide} from "../components/com_collide.js";
import {control_move} from "../components/com_control_move.js";
import {lifespan} from "../components/com_lifespan.js";
import {move} from "../components/com_move.js";
import {trigger} from "../components/com_trigger.js";
import {Blueprint} from "../core.js";
import {Game, Layer} from "../game.js";

export function blueprint_flame_collider(game: Game): Blueprint {
    return {
        Using: [
            control_move([0, 0, 1], null),
            move(10, 0),
            collide(true, Layer.None, Layer.BuildingShell | Layer.BuildingBlock | Layer.Missile),
            trigger(Action.Burn),
            lifespan(1),

            // A debug cube.
            // render_colored_unlit(game.MaterialColoredUnlit, game.MeshCube, [1, 1, 1, 1]),
        ],
    };
}
