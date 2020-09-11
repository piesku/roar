import {Entity, Game} from "../game.js";
import {Has} from "../world.js";

type Controller = "head" | "left" | "right";

export interface ControlPose {
    Controller: Controller;
}

export function control_pose(controller: Controller) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.ControlPose;
        game.World.ControlPose[entity] = {
            Controller: controller,
        };
    };
}
