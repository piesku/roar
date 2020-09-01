import {Entity, Game} from "../game.js";
import {Has} from "../world.js";

export interface ControlFire {
    Trigger: boolean;
    Duration: number;
    Remaining: number;
}

export function control_fire(duration: number) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.ControlFire;
        game.World.ControlFire[entity] = {
            Trigger: false,
            Duration: duration,
            Remaining: 0,
        };
    };
}
