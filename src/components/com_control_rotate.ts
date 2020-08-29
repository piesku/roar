import {Quat} from "../../common/math.js";
import {Entity, Game} from "../game.js";
import {Has} from "../world.js";

export interface ControlRotate {
    Rotation: Quat;
}

export function control_rotate(rotation: Quat) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.ControlRotate;
        game.World.ControlRotate[entity] = {
            Rotation: rotation,
        };
    };
}
