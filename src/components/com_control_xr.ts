import {Entity, Game} from "../game.js";
import {Has} from "../world.js";

type Controller = "motion" | "breath" | "left" | "right";

export interface ControlXr {
    Controller: Controller;
}

export function control_xr(hand: Controller) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.ControlXr;
        game.World.ControlXr[entity] = {
            Controller: hand,
        };
    };
}
