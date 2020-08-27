import {Vec3} from "../../common/math.js";
import {add, scale} from "../../common/vec3.js";
import {Entity, Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Transform | Has.RigidBody;
const GRAVITY = -9.81;

export function sys_physics(game: Game, delta: number) {
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) === QUERY) {
            update(game, i, delta);
        }
    }
}

function update(game: Game, entity: Entity, delta: number) {
    let transform = game.World.Transform[entity];
    let rigid_body = game.World.RigidBody[entity];

    if (rigid_body.Dynamic) {
        // Compute change to velocity, including the gravity.
        scale(rigid_body.Acceleration, rigid_body.Acceleration, delta);
        add(rigid_body.Velocity, rigid_body.Velocity, rigid_body.Acceleration);
        rigid_body.Velocity[1] += GRAVITY * delta;

        // Apply velocity to position.
        let vel_delta: Vec3 = [0, 0, 0];
        scale(vel_delta, rigid_body.Velocity, delta);
        add(transform.Translation, transform.Translation, vel_delta);
        transform.Dirty = true;

        // Reset force/acceleration.
        scale(rigid_body.Acceleration, rigid_body.Acceleration, 0);
    }
}
