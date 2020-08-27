import {Vec3} from "../../common/math.js";
import {Entity, Game} from "../game.js";
import {Has} from "../world.js";

// Assume mass = 1, which means that acceleration and force are numerically equal.

export interface RigidBody {
    readonly Dynamic: boolean;
    Acceleration: Vec3;
    Velocity: Vec3;
}

export function rigid_body(Dynamic: boolean = true) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.RigidBody;
        game.World.RigidBody[entity] = {
            Dynamic,
            Acceleration: [0, 0, 0],
            Velocity: [0, 0, 0],
        };
    };
}
