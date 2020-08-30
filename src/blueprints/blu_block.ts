import {Quat} from "../../common/math.js";
import {element, integer} from "../../common/random.js";
import {collide} from "../components/com_collide.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {Blueprint} from "../core.js";
import {Game, Layer} from "../game.js";

let rotations: Array<Quat> = [
    [0, 0, 0, 1],
    [0, 0.707, 0, 0.707],
    [0, 1, 0, 0],
    [0, -0.707, 0, 0.707],
];

export function blueprint_block(game: Game, height: number): Blueprint {
    let type = integer(1, 4);
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
                    game.Textures["building" + type]
                ),
            ],
        });
    }

    let top = parts[height - 1];
    top.Children = [];

    switch (type) {
        case 1:
            top.Children.push({
                Translation: [0, 0.5, 0],
                Scale: [0.75, 1, 0.75],
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["building" + type]
                    ),
                ],
            });
            break;
        case 2:
            top.Children.push({
                Translation: [-0.125, 0.5, -0.125],
                Scale: [0.5, 0.5, 0.5],
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["building" + type]
                    ),
                ],
            });
            break;
        case 3:
        case 4:
            top.Children.push({
                Translation: [0, 0.125, 0],
                Scale: [0.75, 1, 0.75],
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["building" + type]
                    ),
                ],
            });
            break;
    }

    return {
        Rotation: element(rotations),
        Children: parts,
    };
}
