import {GL_CW} from "../../common/webgl.js";
import {lifespan} from "../components/com_lifespan.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {Blueprint} from "../core.js";
import {Game} from "../game.js";

export function blueprint_debris(game: Game): Blueprint {
    return {
        Scale: [0.1, 0.1, 0.1],
        Using: [
            render_textured_diffuse(
                game.MaterialTexturedDiffuse,
                game.MeshCube,
                game.Textures["noise"],
                GL_CW,
                [0.5, 0.5, 0.5, 1]
            ),
            lifespan(1),
        ],
    };
}
