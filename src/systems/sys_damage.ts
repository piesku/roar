import {destroy} from "../core.js";
import {Entity, Game, Layer} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Damage | Has.Collide;

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
        } else if (other_collide.Layers & Layer.Player) {
            console.log("Player hit");
        }

        // Destroy the damage dealer.
        destroy(game.World, entity);
    }
}
