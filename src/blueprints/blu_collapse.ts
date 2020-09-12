import {from_euler} from "../../common/quat.js";
import {audio_source} from "../components/com_audio_source.js";
import {emit_particles} from "../components/com_emit_particles.js";
import {lifespan} from "../components/com_lifespan.js";
import {render_particles} from "../components/com_render_particles.js";
import {shake} from "../components/com_shake.js";
import {Blueprint} from "../core.js";
import {Game} from "../game.js";
import {snd_explosion} from "../sounds/snd_explosion.js";

export function blueprint_collapse(game: Game): Blueprint {
    return {
        Using: [lifespan(1), audio_source(true, snd_explosion())],
        Children: [
            {
                Rotation: from_euler([0, 0, 0, 0], -90, 0, 0),
                Using: [
                    shake(Infinity, 0.5),
                    emit_particles(1, 0.1, 1, true),
                    render_particles(game.Textures["fire"], [0, 0, 0, 0.5], 50, [1, 1, 1, 0], 100),
                ],
            },
        ],
    };
}
