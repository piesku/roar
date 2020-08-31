import {get_translation} from "../../common/mat4.js";
import {Vec3} from "../../common/math.js";
import {transform_point} from "../../common/vec3.js";
import {CameraKind} from "../components/com_camera.js";
import {Entity, Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Transform | Has.Cull;

export function sys_cull(game: Game, delta: number) {
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) == QUERY) {
            update(game, i);
        }
    }
}

let position: Vec3 = [0, 0, 0];

function update(game: Game, entity: Entity) {
    let cull = game.World.Cull[entity];
    let transform = game.World.Transform[entity];
    get_translation(position, transform.World);

    let camera = game.Camera!;
    if (camera.Kind === CameraKind.Xr) {
        // Just check against the left eye.
        transform_point(position, position, camera.Eyes[0].Pv);
    } else {
        transform_point(position, position, camera.Pv);
    }

    if (Math.abs(position[0]) > 1 || Math.abs(position[1]) > 1 || Math.abs(position[2]) > 1) {
        game.World.Signature[entity] &= ~cull.Mask;
    } else {
        game.World.Signature[entity] |= cull.Mask;
    }
}
