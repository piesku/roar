import {GL_CCW, GL_CW} from "../../common/webgl.js";
import {Action} from "../actions.js";
import {audio_source} from "../components/com_audio_source.js";
import {collide} from "../components/com_collide.js";
import {lifespan} from "../components/com_lifespan.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {shake} from "../components/com_shake.js";
import {toggle} from "../components/com_toggle.js";
import {trigger} from "../components/com_trigger.js";
import {Blueprint} from "../core.js";
import {Game, Layer} from "../game.js";
import {snd_growl} from "../sounds/snd_growl.js";
import {Has} from "../world.js";
import {blueprint_paw} from "./blu_paw.js";

export function blueprint_cage(game: Game): Blueprint {
    return {
        Scale: [0.5, 0.5, 0.5],
        Using: [
            collide(false, Layer.Cage, Layer.PlayerGrip, [0.5, 0.5, 0.5]),
            trigger(Action.CageFound),
            audio_source(true, snd_growl(true)),
            // Grabbable builds have lifespan, imitate them.
            lifespan(Infinity),
        ],
        Children: [
            {
                Using: [shake(Infinity, 0.02), toggle(Has.Shake, 1, true)],
                Children: [
                    {
                        Using: [
                            render_textured_diffuse(
                                game.MaterialTexturedDiffuse,
                                game.MeshCube,
                                game.Textures["cage"]
                            ),
                        ],
                    },
                    {
                        Using: [
                            render_textured_diffuse(
                                game.MaterialTexturedDiffuse,
                                game.MeshCube,
                                game.Textures["cage"],
                                [1, 1, 1, 1],
                                GL_CCW
                            ),
                        ],
                    },
                    {
                        ...blueprint_paw(game, GL_CCW),
                        Translation: [0.2, 0.1, 0.35],
                        Rotation: [0, 1, 0, 0],
                        Scale: [-1, 1, 1],
                    },
                    {
                        ...blueprint_paw(game, GL_CW),
                        Translation: [-0.2, -0.1, 0.35],
                        Rotation: [0, 1, 0, 0],
                    },
                ],
            },
        ],
    };
}
