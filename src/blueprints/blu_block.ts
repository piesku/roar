import {collide} from "../components/com_collide.js";
import {cull} from "../components/com_cull.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {Blueprint} from "../core.js";
import {Game, Layer} from "../game.js";
import {Has} from "../world.js";
import {blueprint_fire} from "./blu_fire.js";
import {blueprint_roof} from "./blu_roof.js";

export function blueprint_block(game: Game, variant: number, has_roof: boolean): Blueprint {
    let block: Blueprint = {
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
                game.Textures["building" + variant]
            ),
            cull(Has.Render),
        ],
        Children: [blueprint_fire(game)],
    };

    if (has_roof) {
        block.Children?.push(blueprint_roof(game, variant));
    }

    return block;
}
