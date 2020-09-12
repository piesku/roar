import {Entity, Game} from "../game.js";
import {Has} from "../world.js";

export const enum ControlXrKind {
    Motion,
    Breath,
    Left,
    Right,
}

export interface ControlXr {
    Kind: ControlXrKind;
}

export function control_xr(kind: ControlXrKind) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.ControlXr;
        game.World.ControlXr[entity] = {
            Kind: kind,
        };
    };
}
