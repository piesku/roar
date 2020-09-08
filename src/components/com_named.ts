import {Err} from "../errors.js";
import {Entity, Game} from "../game.js";
import {Has, World} from "../world.js";

type Name = "head" | "base";

export interface Named {
    Name: Name;
}

export function named(name: Name) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.Named;
        game.World.Named[entity] = {
            Name: name,
        };
    };
}

export function find_first(world: World, name: Name) {
    for (let i = 0; i < world.Signature.length; i++) {
        if (world.Signature[i] & Has.Named && world.Named[i].Name === name) {
            return i;
        }
    }
    return Err.NamedEntityNotFound;
}
