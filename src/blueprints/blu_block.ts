import {collide} from "../components/com_collide.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {Blueprint} from "../core.js";
import {Game, Layer} from "../game.js";

export function blueprint_block(game: Game, texture_name: string): Blueprint {
    return {
        Using: [
            collide(true, Layer.Terrain, Layer.Player | Layer.Terrain),
            rigid_body(RigidKind.Dynamic),
            render_textured_diffuse(
                game.MaterialTexturedDiffuse,
                game.MeshCube,
                game.Textures[texture_name]
            ),
        ],
    };
}
