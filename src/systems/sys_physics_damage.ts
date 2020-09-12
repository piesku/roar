import {Vec3} from "../../common/math.js";
import {dot} from "../../common/vec3.js";
import {blueprint_collapse} from "../blueprints/blu_collapse.js";
import {RigidKind} from "../components/com_rigid_body.js";
import {instantiate} from "../core.js";
import {Entity, Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Collide | Has.RigidBody | Has.Lifespan;

export function sys_physics_damage(game: Game, delta: number) {
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) === QUERY) {
            update(game, i);
        }
    }
}

let one: Vec3 = [1, 1, 1];

function update(game: Game, entity: Entity) {
    let collide = game.World.Collide[entity];
    let rigid_body = game.World.RigidBody[entity];

    if (rigid_body.Kind === RigidKind.Dynamic) {
        for (let i = 0; i < collide.Collisions.length; i++) {
            let collision = collide.Collisions[i];
            if (game.World.Signature[collision.Other] & Has.RigidBody) {
                let other_body = game.World.RigidBody[collision.Other];
                let damage =
                    dot(one, rigid_body.VelocityIntegrated) +
                    dot(one, other_body.VelocityIntegrated);
                if (damage > 1) {
                    // Buildings start with Has.Lifespan disabled but
                    // BuildingShells enable it when they wake up.
                    let lifespan = game.World.Lifespan[entity];
                    lifespan.Remaining -= damage;
                    setTimeout(() => instantiate(game, blueprint_collapse(game)));
                }
            }
        }
    }
}
