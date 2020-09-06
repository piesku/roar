import {get_translation} from "../common/mat4.js";
import {Vec3} from "../common/math.js";
import {copy} from "../common/quat.js";
import {blueprint_explosion} from "./blueprints/blu_explosion.js";
import {destroy, instantiate} from "./core.js";
import {Entity, Game, Layer} from "./game.js";
import {Has} from "./world.js";
import {xr_enter} from "./xr.js";

export const enum Action {
    EnterVr,
    ExitVr,
    Wake,
    Damage,
    Explode,
}

export function dispatch(game: Game, action: Action, payload: unknown) {
    switch (action) {
        case Action.EnterVr: {
            if (game.XrSupported) {
                xr_enter(game);
            }
            break;
        }
        case Action.ExitVr: {
            if (game.XrFrame) {
                game.XrFrame.session.end();
            }
            break;
        }
        case Action.Wake: {
            let [building] = payload as [Entity, Entity];
            let building_transform = game.World.Transform[building];

            // Set world position and rotation, and add colliders to each block.
            for (let block of game.World.Transform[building].Children) {
                let block_transform = game.World.Transform[block];
                block_transform.Translation[0] = building_transform.Translation[0];
                block_transform.Translation[2] = building_transform.Translation[2];
                copy(block_transform.Rotation, building_transform.Rotation);
                game.World.Signature[block] |= Has.Collide | Has.RigidBody;
            }

            // Destroy the outer shell without children.
            setTimeout(() => destroy(game.World, building, false));
            break;
        }
        case Action.Damage: {
            let [missile, other] = payload as [Entity, Entity];
            let other_collide = game.World.Collide[other];
            if (other_collide.Layers & Layer.BuildingBlock) {
                // Destroy the building.
                setTimeout(() => destroy(game.World, other));
            } else if (other_collide.Layers & Layer.PlayerHand) {
                console.log("Player hit");
            }
            // No break; fall through to Explode.
        }
        case Action.Explode: {
            let [missile, other] = payload as [Entity, Entity];
            // Create an explosion.
            let transform = game.World.Transform[missile];
            let position: Vec3 = [0, 0, 0];
            get_translation(position, transform.World);
            instantiate(game, {
                Translation: position,
                ...blueprint_explosion(game),
            });

            // Destroy the missile.
            setTimeout(() => destroy(game.World, missile));
            break;
        }
    }
}
