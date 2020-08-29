import {Quat} from "../../common/math.js";
import {Entity, Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.ControlRotate | Has.Transform | Has.Move;

export function sys_control_rotate(game: Game, delta: number) {
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) === QUERY) {
            update(game, i);
        }
    }
}

function update(game: Game, entity: Entity) {
    let control = game.World.ControlRotate[entity];
    let move = game.World.Move[entity];
    move.LocalRotations.push(control.Rotation.slice() as Quat);
}
