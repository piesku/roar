import {emit_particles} from "../components/com_emit_particles.js";
import {render_particles} from "../components/com_render_particles.js";
import {shake} from "../components/com_shake.js";
import {Blueprint} from "../core.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export function blueprint_fire(game: Game): Blueprint {
    return {
        Rotation: [-0.7071, 0, 0, 0.7071],
        Children: [
            {
                Using: [
                    shake(Infinity, 0.5),
                    emit_particles(5, 0.05, 1, true),
                    render_particles(game.Textures["fire"], [1, 1, 0, 0.3], 50, [1, 0, 0, 0], 10),
                ],
                Disable: Has.Transform,
            },
        ],
    };
}
