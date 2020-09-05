import {from_euler} from "../../common/quat.js";
import {collide} from "../components/com_collide.js";
import {cull} from "../components/com_cull.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {Blueprint} from "../core.js";
import {Game, Layer} from "../game.js";
import {Has} from "../world.js";
import {blueprint_fire} from "./blu_fire.js";

export function blueprint_star(game: Game): Blueprint {
    return {
        Using: [
            collide(
                true,
                Layer.Building,
                Layer.Ground | Layer.Building | Layer.Player | Layer.Missile
            ),
            rigid_body(RigidKind.Dynamic),
            render_textured_diffuse(
                game.MaterialTexturedDiffuse,
                game.MeshCube,
                game.Textures["building2"]
            ),
            cull(Has.Render),
        ],
        Children: [
            {
                Translation: [0, -0.1, 0],
                Rotation: from_euler([0, 0, 0, 0], 0, 45, 0),
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["building2"]
                    ),
                    cull(Has.Render),
                ],
            },
            blueprint_fire(game),
        ],
    };
}
