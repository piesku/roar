import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {Blueprint} from "../core.js";
import {Game} from "../game.js";

export function blueprint_roof(game: Game, type: number): Blueprint {
    switch (type) {
        case 1:
            return {
                Translation: [0, 0.5, 0],
                Scale: [0.75, 1, 0.75],
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["building" + type]
                    ),
                ],
            };
        case 2:
            return {
                Translation: [-0.125, 0.5, -0.125],
                Scale: [0.5, 0.5, 0.5],
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["building" + type]
                    ),
                ],
            };
        // Cases 3 and 4
        default:
            return {
                Translation: [0, 0.125, 0],
                Scale: [0.75, 1, 0.75],
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["building" + type]
                    ),
                ],
            };
    }
}
