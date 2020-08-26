import {from_euler} from "../../common/quat.js";
import {integer, set_seed} from "../../common/random.js";
import {blueprint_block} from "../blueprints/blu_block.js";
import {blueprint_camera} from "../blueprints/blu_camera.js";
import {blueprint_viewer} from "../blueprints/blu_viewer.js";
import {light_directional} from "../components/com_light.js";
import {render_diffuse} from "../components/com_render_diffuse.js";
import {instantiate} from "../core.js";
import {Game} from "../game.js";
import {World} from "../world.js";

export function scene_stage(game: Game) {
    game.World = new World();
    game.Camera = undefined;
    game.ViewportResized = true;
    game.Gl.clearColor(0.9, 0.9, 0.9, 1);

    set_seed(Date.now());

    // Camera.
    instantiate(game, {
        ...blueprint_camera(game),
        Translation: [0, 10, 10],
        Rotation: from_euler([0, 0, 0, 0], 30, 180, 0),
    });

    // VR Camera.
    instantiate(game, {
        Translation: [1, 2, 5],
        ...blueprint_viewer(game),
    });

    // Light.
    instantiate(game, {
        Translation: [2, 4, 3],
        Using: [light_directional([1, 1, 1], 1)],
    });

    // Ground.
    instantiate(game, {
        Translation: [0, 0, 0],
        Scale: [7, 1, 7],
        Using: [render_diffuse(game.MaterialDiffuseGouraud, game.MeshCube, [1, 1, 0.3, 1])],
    });

    let grid_size = 10;

    for (let z = -grid_size / 2; z <= grid_size / 2; z++) {
        for (let x = -grid_size / 2; x <= grid_size / 2; x++) {
            let count = integer(1, 4);
            for (let y = 0; y < count; y++) {
                instantiate(game, {
                    ...blueprint_block(game),
                    Translation: [x, y, z],
                });
            }
        }
    }
}
