import {from_euler} from "../../common/quat.js";
import {float} from "../../common/random.js";
import {Action} from "../actions.js";
import {aim} from "../components/com_aim.js";
import {audio_source} from "../components/com_audio_source.js";
import {collide} from "../components/com_collide.js";
import {control_move} from "../components/com_control_move.js";
import {emit_particles} from "../components/com_emit_particles.js";
import {lifespan} from "../components/com_lifespan.js";
import {light_point} from "../components/com_light.js";
import {move} from "../components/com_move.js";
import {find_first, Name} from "../components/com_named.js";
import {render_particles} from "../components/com_render_particles.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {shake} from "../components/com_shake.js";
import {trigger} from "../components/com_trigger.js";
import {Blueprint} from "../core.js";
import {Game, Layer} from "../game.js";
import {snd_missile} from "../sounds/snd_missile.js";

export function blueprint_missile(game: Game): Blueprint {
    return {
        Using: [
            control_move([0, 0, 1], null),
            collide(true, Layer.Missile, Layer.Ground | Layer.BuildingBlock | Layer.PlayerBody),
            trigger(Action.Damage),
            aim(find_first(game.World, Name.Head)),
            move(float(8, 12), 3),
            lifespan(9),
            audio_source(true, snd_missile),
        ],
        Children: [
            {
                // Body.
                Rotation: from_euler([0, 0, 0, 0], 90, 0, 0),
                Scale: [0.1, 1, 0.1],
                Using: [
                    control_move(null, [0, 0, 1, 0]),
                    move(0, 5),
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["missile"]
                    ),
                ],
            },
            {
                // Jet.
                Translation: [0, 0, -1],
                Using: [light_point([1, 0.5, 0], 1)],
                Children: [
                    {
                        // Jet exhaust.
                        Rotation: [0, 1, 0, 0],
                        Using: [
                            shake(Infinity, 0.02),
                            emit_particles(1, 0.01, 10, true),
                            render_particles(
                                game.Textures["fire"],
                                [1, 0.5, 0, 0.3],
                                50,
                                [1, 1, 0, 0],
                                10
                            ),
                        ],
                    },
                ],
            },
        ],
    };
}
