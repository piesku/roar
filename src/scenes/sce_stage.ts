import {from_euler} from "../../common/quat.js";
import {float, integer, set_seed} from "../../common/random.js";
import {GL_CW} from "../../common/webgl.js";
import {blueprint_block} from "../blueprints/blu_block.js";
import {blueprint_camera} from "../blueprints/blu_camera.js";
import {blueprint_moon} from "../blueprints/blu_moon.js";
import {blueprint_star} from "../blueprints/blu_star.js";
import {blueprint_viewer} from "../blueprints/blu_viewer.js";
import {collide} from "../components/com_collide.js";
import {light_directional} from "../components/com_light.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {instantiate} from "../core.js";
import {Game, Layer} from "../game.js";
import {World} from "../world.js";

export function scene_stage(game: Game) {
    game.World = new World();
    game.Camera = undefined;
    game.ViewportResized = true;
    game.Gl.clearColor(0.0, 0.1, 0.2, 1);

    set_seed(Date.now());

    // Camera.
    instantiate(game, {
        ...blueprint_camera(game),
        Translation: [0, 10, 10],
        Rotation: from_euler([0, 0, 0, 0], 30, 180, 0),
    });

    // VR Camera.
    instantiate(game, {
        ...blueprint_viewer(game),
        Translation: [0, 6, 0],
        Scale: [4, 4, 4],
    });

    // Main Light.
    instantiate(game, {
        Translation: [2, 4, 3],
        Using: [light_directional([1, 1, 1], 0.3)],
    });

    // Moon.
    instantiate(game, blueprint_moon(game));

    let grid_size = 16;

    // Ground.
    instantiate(game, {
        Scale: [grid_size, 1, grid_size],
        Using: [collide(false, Layer.Terrain, Layer.None), rigid_body(RigidKind.Static)],
        Children: [
            {
                Translation: [0, 0.5, 0],
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshPlane,
                        game.Textures["road"],
                        GL_CW,
                        [1, 1, 1, 1],
                        [grid_size / 2, grid_size / 2]
                    ),
                ],
            },
        ],
    });

    for (let z = -grid_size / 2; z < grid_size / 2; z++) {
        for (let x = -grid_size / 2; x < grid_size / 2; x++) {
            if (x % 2 === 0 || z % 2 === 0) {
                continue;
            }
            let height = integer(1, 4);
            if (float() > 0.2) {
                // Square tower.
                instantiate(game, {
                    ...blueprint_block(game, height),
                    Translation: [x + 0.5, 1, z - 0.5],
                });
            } else {
                // Star tower.
                instantiate(game, {
                    ...blueprint_star(game, height),
                    Translation: [x + 0.5, 1, z - 0.5],
                });
            }
        }
    }
}
