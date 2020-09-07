import {from_euler} from "../../common/quat.js";
import {control_fire} from "../components/com_control_fire.js";
import {cull} from "../components/com_cull.js";
import {emit_particles} from "../components/com_emit_particles.js";
import {render_particles} from "../components/com_render_particles.js";
import {shake} from "../components/com_shake.js";
import {Blueprint} from "../core.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export function blueprint_fire(game: Game): Blueprint {
    return {
        Rotation: from_euler([0, 0, 0, 0], -80, 10, 0),
        Children: [
            {
                Using: [
                    control_fire(15),
                    shake(Infinity, 0.5),
                    emit_particles(5, 0.05, 1, true),
                    render_particles(game.Textures["fire"], [1, 0.5, 0, 0.2], 50, [1, 0, 0, 0], 10),
                    cull(Has.Shake | Has.EmitParticles | Has.Render),
                ],
            },
        ],
    };
}
