import {Quat} from "../../common/math.js";
import {element, float, integer} from "../../common/random.js";
import {Action} from "../actions.js";
import {collide} from "../components/com_collide.js";
import {trigger} from "../components/com_trigger.js";
import {Blueprint} from "../core.js";
import {Game, Layer} from "../game.js";
import {blueprint_block} from "./blu_block.js";
import {blueprint_star} from "./blu_star.js";

let min_height = 2;
let max_height = 4;
let rotations: Array<Quat> = [
    [0, 0, 0, 1],
    [0, 0.7071, 0, 0.7071],
    [0, 1, 0, 0],
    [0, -0.7071, 0, 0.7071],
];

export function blueprint_building(game: Game): Blueprint {
    let height = integer(min_height, max_height);
    let rotation = element(rotations);
    let blocks: Array<Blueprint> = [];

    if (float() > 0.2) {
        // Square tower.
        let variant = integer(1, 4);
        for (let y = 1; y <= height; y++) {
            blocks.push({
                ...blueprint_block(game, variant, y === height),
                Translation: [0, y - 0.5, 0],
                Rotation: rotation.slice() as Quat,
            });
        }
    } else {
        // Star tower.
        for (let y = 1; y <= height; y++) {
            blocks.push({
                ...blueprint_star(game),
                Translation: [0, y - 0.5, 0],
                Rotation: rotation.slice() as Quat,
            });
        }
    }

    return {
        Using: [
            collide(
                false,
                Layer.BuildingShell,
                Layer.BuildingBlock | Layer.PlayerHand | Layer.PlayerGrip | Layer.Missile,
                [1, height * 2, 1]
            ),
            trigger(Action.Wake),
        ],
        Children: blocks,
    };
}
