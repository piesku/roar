import {get_translation} from "../../common/mat4.js";
import {Vec3} from "../../common/math.js";
import {blueprint_explosion} from "../blueprints/blu_explosion.js";
import {destroy, instantiate} from "../core.js";
import {Entity, Game, Layer} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Collide | Has.Damage | Has.Transform;

export function sys_damage(game: Game, delta: number) {
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) == QUERY) {
            update(game, i);
        }
    }
}

function update(game: Game, entity: Entity) {
    let collide = game.World.Collide[entity];

    for (let i = 0; i < collide.Collisions.length; i++) {
        let other = collide.Collisions[i].Other;
        let other_collide = game.World.Collide[other];
        if (other_collide.Layers & Layer.Building) {
            // Destroy the building.
            destroy(game.World, other);

            // Create an explosion.
            let transform = game.World.Transform[entity];
            let position: Vec3 = [0, 0, 0];
            get_translation(position, transform.World);
            instantiate(game, {
                Translation: position,
                ...blueprint_explosion(game),
            });
        } else if (other_collide.Layers & Layer.Player) {
            console.log("Player hit");
        }

        // Destroy the damage dealer.
        destroy(game.World, entity);
    }
}
