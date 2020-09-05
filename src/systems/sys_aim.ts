import {get_translation} from "../../common/mat4.js";
import {Quat, Vec3} from "../../common/math.js";
import {rotation_to} from "../../common/quat.js";
import {normalize, transform_point} from "../../common/vec3.js";
import {Entity, Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Transform | Has.Aim | Has.Move;
const FORWARD: Vec3 = [0, 0, 1];

export function sys_aim(game: Game, delta: number) {
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) == QUERY) {
            update(game, i);
        }
    }
}

let target_position: Vec3 = [0, 0, 0];

function update(game: Game, entity: Entity) {
    let aim = game.World.Aim[entity];

    if (aim.Target !== undefined) {
        let transform = game.World.Transform[entity];
        let move = game.World.Move[entity];

        let target_transform = game.World.Transform[aim.Target];
        get_translation(target_position, target_transform.World);
        transform_point(target_position, target_position, transform.Self);
        normalize(target_position, target_position);

        let rotation_to_target: Quat = [0, 0, 0, 0];
        rotation_to(rotation_to_target, FORWARD, target_position);
        move.SelfRotations.push(rotation_to_target);
    }
}
