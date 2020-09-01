import {Blueprint} from "../core.js";
import {Entity, Game} from "../game.js";
import {Has} from "../world.js";

interface Creator {
    (game: Game): Blueprint;
}

export interface ControlSpawn {
    Creator: Creator;
    Frequency: number;
    SinceLast: number;
}

export function control_spawn(creator: Creator, frequency: number) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.ControlSpawn;
        game.World.ControlSpawn[entity] = {
            Creator: creator,
            Frequency: frequency,
            SinceLast: 0,
        };
    };
}
