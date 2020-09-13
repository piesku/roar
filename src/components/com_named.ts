import {Entity, Game} from "../game.js";
import {Has, World} from "../world.js";

export const enum Name {
    Base,
    Head,
    Front,
    Mouth,
    Ground,
    Shell,
    Block,
    IntroHelicopter,
}

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

export function* find_all(world: World, name: Name) {
    for (let i = 0; i < world.Signature.length; i++) {
        if (world.Signature[i] & Has.Named && world.Named[i].Name === name) {
            yield i;
        }
    }
}

export function find_first(world: World, name: Name) {
    for (let entity of find_all(world, name)) {
        return entity;
    }
    throw `No entity named ${name}.`;
}
