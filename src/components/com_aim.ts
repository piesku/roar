import {Entity, Game} from "../game.js";
import {Has} from "../world.js";

export interface Aim {
    Target: Entity;
}

export function aim(target: Entity) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.Aim;
        game.World.Aim[entity] = {
            Target: target,
        };
    };
}
