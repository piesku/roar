import {GL_CCW, GL_CW} from "../../common/webgl.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {Blueprint} from "../core.js";
import {Game} from "../game.js";
import {blueprint_paw} from "./blu_paw.js";

export function blueprint_cage(game: Game): Blueprint {
    return {
        Scale: [0.5, 0.5, 0.5],
        Using: [
            render_textured_diffuse(
                game.MaterialTexturedDiffuse,
                game.MeshCube,
                game.Textures["cage"]
            ),
        ],
        Children: [
            {
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["cage"],
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
    };
}
