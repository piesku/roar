import {get_translation} from "../common/mat4.js";
import {Vec3} from "../common/math.js";
import {copy} from "../common/quat.js";
import {blueprint_collapse} from "./blueprints/blu_collapse.js";
import {blueprint_explosion} from "./blueprints/blu_explosion.js";
import {find_all, find_first, Name} from "./components/com_named.js";
import {RigidKind} from "./components/com_rigid_body.js";
import {query_all} from "./components/com_transform.js";
import {destroy, instantiate} from "./core.js";
import {Entity, Game, Layer} from "./game.js";
import {scene_grid} from "./scenes/sce_grid.js";
import {scene_title} from "./scenes/sce_title.js";
import {snd_growl} from "./sounds/snd_growl.js";
import {Has} from "./world.js";
import {xr_enter} from "./xr.js";

export const enum StageKind {
    Title,
    Intro,
    Playing,
    Clear,
    Failed,
}

export const enum Action {
    GoToTitle,
    GoToStage,
    EnterVr,
    ExitVr,
    Wake,
    Damage,
    Explode,
    Burn,
    Collapse,
    CageFound,
}

export function dispatch(game: Game, action: Action, payload: unknown) {
    switch (action) {
        case Action.GoToStage: {
            game.CurrentStage = StageKind.Intro;
            let helicopter = find_first(game.World, Name.IntroHelicopter);
            game.World.Signature[helicopter] |= Has.Move;
            setTimeout(() => {
                game.CurrentStage = StageKind.Playing;
                scene_grid(game);
                if (game.XrSupported) {
                    xr_enter(game);
                }
            }, 5000);
            break;
        }
        case Action.EnterVr: {
            if (game.XrSupported) {
                xr_enter(game);
            }
            break;
        }
        case Action.GoToTitle: {
            setTimeout(() => scene_title(game));
            // Fall through to ExitVr.
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
                game.World.Signature[block] |= Has.Collide | Has.RigidBody | Has.Lifespan;
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
                let ground = find_first(game.World, Name.Ground);
                game.World.Signature[ground] &= ~Has.Collide;

                for (let shell of find_all(game.World, Name.Shell)) {
                    game.World.RigidBody[shell].Kind = RigidKind.Dynamic;
                }

                if (game.CurrentStage === StageKind.Playing) {
                    game.CurrentStage = StageKind.Failed;
                    setTimeout(() => {
                        dispatch(game, Action.GoToTitle, undefined);
                    }, 1000);
                }
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
        case Action.Burn: {
            let [flame_entity, other_entity] = payload as [Entity, Entity];
            let other_collider = game.World.Collide[other_entity];

            if (other_collider.Layers & Layer.Missile) {
                dispatch(game, Action.Explode, [other_entity]);
            } else {
                for (let fire_entity of query_all(game.World, other_entity, Has.ControlFire)) {
                    game.World.ControlFire[fire_entity].Trigger = true;
                    // Just one fire is enough.
                    break;
                }
            }

            // Destroy the flame collider.
            setTimeout(() => destroy(game.World, flame_entity));
            break;
        }
        case Action.Collapse: {
            let building = payload as Entity;

            // Create the collapse smoke.
            let transform = game.World.Transform[building];
            let position: Vec3 = [0, 0, 0];
            get_translation(position, transform.World);
            instantiate(game, {
                Translation: position,
                ...blueprint_collapse(game),
            });

            break;
        }
        case Action.CageFound: {
            let [cage_entity] = payload as [Entity, Entity];
            let cage_transform = game.World.Transform[cage_entity];
            if (cage_transform.Parent) {
                // The player has grabbed the cage.
                game.World.Signature[cage_entity] &= ~Has.Trigger;
                game.World.Collide[cage_entity].Dynamic = true;

                let mouth_entity = find_first(game.World, Name.Mouth);
                let mouth_audio = game.World.AudioSource[mouth_entity];
                mouth_audio.Trigger = snd_growl(false);

                for (let block of find_all(game.World, Name.Block)) {
                    game.World.Signature[block] |= Has.Lifespan;
                    game.World.Lifespan[block].Remaining = Math.random() * 2;
                }

                if (game.CurrentStage === StageKind.Playing) {
                    game.CurrentStage = StageKind.Clear;
                    setTimeout(() => {
                        dispatch(game, Action.GoToTitle, undefined);
                    }, 5000);
                }
            }
            break;
        }
    }
}
