import {from_euler} from "../../common/quat.js";
import {set_seed} from "../../common/random.js";
import {blueprint_camera} from "../blueprints/blu_camera.js";
import {blueprint_missile} from "../blueprints/blu_missile.js";
import {blueprint_viewer} from "../blueprints/blu_viewer.js";
import {control_move} from "../components/com_control_move.js";
import {control_spawn} from "../components/com_control_spawn.js";
import {move} from "../components/com_move.js";
import {instantiate} from "../core.js";
import {Game} from "../game.js";
import {World} from "../world.js";

export function scene_test3(game: Game) {
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
    instantiate(game, blueprint_viewer(game, 1));

    // Missile spawner.
    instantiate(game, {
        //Translation: [0, 20, 0],
        Using: [control_move(null, [0, 1, 0, 0]), move(0, 2)],
        Children: [
            {
                Translation: [0, 0, -5],
                Rotation: from_euler([0, 0, 0, 0], -70, 0, 0),
                Using: [
                    control_move(null, [0, 1, 0, 0]),
                    control_spawn(blueprint_missile, 14),
                    move(0, 5),
                ],
            },
        ],
    });
}
