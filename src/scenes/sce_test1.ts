import {from_euler} from "../../common/quat.js";
import {GL_CW} from "../../common/webgl.js";
import {blueprint_block} from "../blueprints/blu_block.js";
import {blueprint_camera} from "../blueprints/blu_camera.js";
import {blueprint_viewer} from "../blueprints/blu_viewer.js";
import {collide} from "../components/com_collide.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {instantiate} from "../core.js";
import {Game, Layer} from "../game.js";
import {World} from "../world.js";

export function scene_test1(game: Game) {
    game.World = new World();
    game.Camera = undefined;
    game.ViewportResized = true;
    game.Gl.clearColor(0.0, 0.1, 0.2, 1);

    // Camera.
    instantiate(game, {
        ...blueprint_camera(game),
        Translation: [0, 10, 10],
        Rotation: from_euler([0, 0, 0, 0], 30, 180, 0),
    });

    // VR Camera.
    instantiate(game, blueprint_viewer(game, 3));

    // Ground.
    instantiate(game, {
        Translation: [0, -0.5, 0],
        Scale: [10, 1, 10],
        Using: [
            collide(false, Layer.Ground, Layer.None, [10, 1, 10]),
            rigid_body(RigidKind.Static),
        ],
        Children: [
            {
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["fire"],
                        [1, 1, 1, 1],
                        GL_CW,
                        -2
                    ),
                ],
            },
        ],
    });

    for (let y = 1; y <= 3; y++) {
        instantiate(game, {
            ...blueprint_block(game, 1, false),
            Translation: [0, y + 0.5, -2],
        });
    }
}
