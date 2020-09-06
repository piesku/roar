import {destroy} from "./core.js";
import {Entity, Game} from "./game.js";
import {Has} from "./world.js";
import {xr_enter} from "./xr.js";

export const enum Action {
    EnterVr,
    ExitVr,
    Wake,
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
            if (game.World.Signature[building] === 0) {
                // The building has already been woken up.
                break;
            }

            let [x, y, z] = game.World.Transform[building].Translation;

            // Set world position and add colliders to each block.
            for (let block of game.World.Transform[building].Children) {
                game.World.Transform[block].Translation[0] = x;
                game.World.Transform[block].Translation[2] = z;
                game.World.Signature[block] |= Has.Collide | Has.RigidBody;
            }

            // Destroy the outer shell without children.
            destroy(game.World, building, false);
            break;
        }
    }
}
