import {add, copy} from "../../common/vec3.js";
import {Entity, Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Transform | Has.Collide | Has.RigidBody;

export function sys_resolution(game: Game, delta: number) {
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) === QUERY) {
            update(game, i, delta);
        }
    }
}

function update(game: Game, entity: Entity, delta: number) {
    let transform = game.World.Transform[entity];
    let collide = game.World.Collide[entity];
    let rigid_body = game.World.RigidBody[entity];

    if (rigid_body.Dynamic) {
        for (let i = 0; i < collide.Collisions.length; i++) {
            let collision = collide.Collisions[i];
            if (game.World.Signature[collision.Other] & Has.RigidBody) {
                // Dynamic rigid bodies are only supported for top-level
                // entities. Thus, no need to apply the world → self → local
                // conversion to the collision response. Local space is world space.
                add(transform.Translation, transform.Translation, collision.Hit);
                transform.Dirty = true;

                // Assume mass = 1 for all rigid bodies. On collision,
                // velocities are swapped, unless the other body is a static
                // one (and behaves as if it had infinite mass).
                let other_body = game.World.RigidBody[collision.Other];
                let this_velocity = rigid_body.Velocity;
                copy(rigid_body.Velocity, other_body.Velocity);
                if (other_body.Dynamic) {
                    copy(other_body.Velocity, this_velocity);
                }

                if (
                    // The rigid body was falling and hit something below it.
                    (collision.Hit[1] > 0 && rigid_body.Velocity[1] < 0) ||
                    // The rigid body was going up and hit something above it.
                    (collision.Hit[1] < 0 && rigid_body.Velocity[1] > 0)
                ) {
                    rigid_body.Velocity[1] = 0;
                }
            }
        }
    }
}
