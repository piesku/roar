import {Quat} from "../../common/math.js";
import {from_euler} from "../../common/quat.js";
import {element, float, integer, set_seed} from "../../common/random.js";
import {GL_CW} from "../../common/webgl.js";
import {blueprint_block} from "../blueprints/blu_block.js";
import {blueprint_camera} from "../blueprints/blu_camera.js";
import {blueprint_moon} from "../blueprints/blu_moon.js";
import {blueprint_police} from "../blueprints/blu_police.js";
import {blueprint_star} from "../blueprints/blu_star.js";
import {blueprint_viewer} from "../blueprints/blu_viewer.js";
import {collide} from "../components/com_collide.js";
import {control_move} from "../components/com_control_move.js";
import {control_spawn} from "../components/com_control_spawn.js";
import {light_directional} from "../components/com_light.js";
import {move} from "../components/com_move.js";
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

    let max_height = 4;
    let rotations: Array<Quat> = [
        [0, 0, 0, 1],
        [0, 0.7071, 0, 0.7071],
        [0, 1, 0, 0],
        [0, -0.7071, 0, 0.7071],
    ];

    for (let z = -grid_size / 2; z < grid_size / 2; z++) {
        for (let x = -grid_size / 2; x < grid_size / 2; x++) {
            if (x % 2 === 0 || z % 2 === 0) {
                continue;
            }
            let height = integer(1, max_height);
            let variant = integer(1, 4);
            let rotation = element(rotations);
            if (float() > 0.2) {
                // Square tower.
                for (let y = 1; y <= height; y++) {
                    instantiate(game, {
                        ...blueprint_block(game, variant, y === height),
                        Translation: [x + 0.5, y, z - 0.5],
                        Rotation: rotation,
                    });
                }
            } else {
                // Star tower.
                for (let y = 1; y <= height; y++) {
                    instantiate(game, {
                        ...blueprint_star(game),
                        Translation: [x + 0.5, y, z - 0.5],
                        Rotation: rotation,
                    });
                }
            }
        }
    }

    // Police car spawner.
    instantiate(game, {
        Translation: [0, 0.6, 0],
        Using: [control_move(null, [0, 1, 0, 0]), move(0, 1)],
        Children: [
            {
                Translation: [0, 0, -8],
                Using: [control_spawn(blueprint_police, 15)],
            },
        ],
    });
}
