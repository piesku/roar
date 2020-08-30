import {from_euler} from "../../common/quat.js";
import {collide} from "../components/com_collide.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {Blueprint} from "../core.js";
import {Game, Layer} from "../game.js";

export function blueprint_star(game: Game, height: number): Blueprint {
    let parts: Array<Blueprint> = [];
    for (let i = 0; i < height; i++) {
        parts.push({
            Translation: [0, i, 0],
            Using: [
                collide(true, Layer.Terrain, Layer.Player | Layer.Terrain),
                rigid_body(RigidKind.Dynamic),
                render_textured_diffuse(
                    game.MaterialTexturedDiffuse,
                    game.MeshCube,
                    game.Textures["building2"]
                ),
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
                    ],
                },
            ],
        });
    }

    return {
        Children: parts,
    };
}
