import {Entity, Game} from "../game.js";
import {Has} from "../world.js";

export interface Shake {
    Duration: number;
    Magnitude: number;
}

/**
 * sys_shake modifies the transform of the entity. Add it to children only.
 */
export function shake(duration: number, magnitude: number) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.Shake;
        game.World.Shake[entity] = {
            Duration: duration,
            Magnitude: magnitude,
        };
    };
}
