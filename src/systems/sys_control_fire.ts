import {ease_in_quad} from "../../common/easing.js";
import {Entity, Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.ControlFire;

export function sys_control_fire(game: Game, delta: number) {
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) === QUERY) {
            update(game, i, delta);
        }
    }
}

function update(game: Game, entity: Entity, delta: number) {
    let control = game.World.ControlFire[entity];

    if (control.Trigger) {
        // Start the fire.
        game.World.Signature[entity] |= Has.Transform;
        control.Remaining = control.Duration;
        control.Trigger = false;
    }

    if (control.Remaining > 0) {
        let emitter = game.World.EmitParticles[entity];
        let t = control.Remaining / control.Duration;
        emitter.Frequency = ease_in_quad(1.1 - t);
        control.Remaining -= delta;

        // Damage the building if it's been awaken.
        let transform = game.World.Transform[entity];
        if (transform.Parent && game.World.Signature[transform.Parent] & Has.Lifespan) {
            let parent_lifespan = game.World.Lifespan[transform.Parent];
            parent_lifespan.Remaining -= delta;
        }
    } else {
        // Put the fire out.
        game.World.Signature[entity] &= ~Has.Transform;
    }
}
