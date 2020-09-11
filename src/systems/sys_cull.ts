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

let world_pos: Vec3 = [0, 0, 0];
let ndc_pos: Vec3 = [0, 0, 0];
let view_pos: Vec3 = [0, 0, 0];

function update(game: Game, entity: Entity) {
    let cull = game.World.Cull[entity];
    let transform = game.World.Transform[entity];
    get_translation(world_pos, transform.World);

    let camera = game.Camera!;
    if (camera.Kind === CameraKind.Xr) {
        // Just check against the left eye.
        transform_point(ndc_pos, world_pos, camera.Eyes["left"].Pv);
        transform_point(view_pos, world_pos, camera.Eyes["left"].View);
    } else {
        transform_point(ndc_pos, world_pos, camera.Pv);
        transform_point(view_pos, world_pos, camera.View);
    }

    if (
        Math.abs(ndc_pos[0]) > 1.1 ||
        Math.abs(ndc_pos[1]) > 1.1 ||
        Math.abs(view_pos[2]) > camera.CullDistance
    ) {
        game.World.Signature[entity] &= ~cull.Mask;
    } else {
        game.World.Signature[entity] |= cull.Mask;
    }
}
