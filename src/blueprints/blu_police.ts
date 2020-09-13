import {float} from "../../common/random.js";
import {GL_CW} from "../../common/webgl.js";
import {aim} from "../components/com_aim.js";
import {audio_source} from "../components/com_audio_source.js";
import {collide} from "../components/com_collide.js";
import {control_move} from "../components/com_control_move.js";
import {lifespan} from "../components/com_lifespan.js";
import {light_point} from "../components/com_light.js";
import {move} from "../components/com_move.js";
import {find_first, Name} from "../components/com_named.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {toggle} from "../components/com_toggle.js";
import {Blueprint} from "../core.js";
import {Game, Layer} from "../game.js";
import {snd_siren} from "../sounds/snd_siren.js";
import {Has} from "../world.js";

export function blueprint_police(game: Game): Blueprint {
    return {
        Scale: [0.03, 0.03, 0.03],
        Using: [
            control_move([0, 0, 1], null),
            aim(find_first(game.World, Name.Base)),
            move(float(1, 3), float(2, 4)),
            collide(true, Layer.Vehicle, Layer.None, [0.5, 0.5, 0.5]),
            rigid_body(RigidKind.Static),
            audio_source(true, snd_siren()),
            lifespan(8),
        ],
        Children: [
            {
                Translation: [-0.5, 2, 0],
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["noise"],
                        [99, 99, 0, 1]
                    ),
                    light_point([1, 0, 0], 2),
                    toggle(Has.Render | Has.Light, 0.5, true),
                ],
            },
            {
                Translation: [0.5, 2, 0],
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["noise"],
                        [0, 99, 99, 1]
                    ),
                    light_point([0, 0, 1], 2),
                    toggle(Has.Render | Has.Light, 0.5, false),
                ],
            },
            {
                // Chassis.
                Translation: [0, 0.5, 0],
                Scale: [2, 1, 5],
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["police"],
                        [1, 1, 1, 1],
                        GL_CW,
                        -2
                    ),
                ],
            },
            {
                // Top.
                Translation: [0, 1.25, 0],
                Rotation: [0.7071, 0, 0, 0.7071],
                Scale: [2, 2, 0.5],
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["police"],
                        [1, 1, 1, 1],
                        GL_CW,
                        -2
                    ),
                ],
            },
        ],
    };
}
