import {Action} from "../actions.js";
import {Entity, Game} from "../game.js";
import {Has} from "../world.js";

export interface Lifespan {
    Max: number;
    Age: number;
    Action?: Action;
}

export function lifespan(max = Infinity, action?: Action) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.Lifespan;
        game.World.Lifespan[entity] = {
            Max: max,
            Age: 0,
            Action: action,
        };
    };
}
