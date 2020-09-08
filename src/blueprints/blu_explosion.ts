import {from_euler} from "../../common/quat.js";
import {audio_source} from "../components/com_audio_source.js";
import {emit_particles} from "../components/com_emit_particles.js";
import {lifespan} from "../components/com_lifespan.js";
import {light_point} from "../components/com_light.js";
import {render_particles} from "../components/com_render_particles.js";
import {shake} from "../components/com_shake.js";
import {toggle} from "../components/com_toggle.js";
import {Blueprint} from "../core.js";
import {Game} from "../game.js";
import {snd_explosion} from "../sounds/snd_explosion.js";
import {Has} from "../world.js";

export function blueprint_explosion(game: Game): Blueprint {
    return {
        Using: [
            audio_source(true, snd_explosion),
            lifespan(1),
            light_point([1, 1, 1], 3),
            toggle(Has.Light, 0.1, true),
        ],
        Children: [
            {
                Rotation: from_euler([0, 0, 0, 0], -90, 0, 0),
                Using: [
                    shake(Infinity, 0.5),
                    emit_particles(1, 0, 0.2, true),
                    render_particles(game.Textures["fire"], [1, 1, 1, 0.5], 100, [1, 1, 1, 0], 10),
                    light_point([1, 0.5, 0], 3),
                    toggle(Has.Light, 0.3, true),
                ],
            },
        ],
    };
}
