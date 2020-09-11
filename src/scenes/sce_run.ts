import {from_euler} from "../../common/quat.js";
import {set_seed} from "../../common/random.js";
import {GL_CW} from "../../common/webgl.js";
import {blueprint_building} from "../blueprints/blu_building.js";
import {blueprint_camera} from "../blueprints/blu_camera.js";
import {blueprint_helicopter} from "../blueprints/blu_helicopter.js";
import {blueprint_missile} from "../blueprints/blu_missile.js";
import {blueprint_moon} from "../blueprints/blu_moon.js";
import {blueprint_police} from "../blueprints/blu_police.js";
import {blueprint_viewer} from "../blueprints/blu_viewer.js";
import {collide} from "../components/com_collide.js";
import {control_move} from "../components/com_control_move.js";
import {control_spawn} from "../components/com_control_spawn.js";
import {light_directional} from "../components/com_light.js";
import {move} from "../components/com_move.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {
    BUILDING_SPAWN_FREQUENCY,
    BUILDING_SPAWN_Z,
    MISSILE_SPAWN_FREQUENCY,
    MISSILE_SPAWN_Z,
    PLAYER_SPEED,
} from "../config.js";
import {instantiate} from "../core.js";
import {Game, Layer} from "../game.js";
import {World} from "../world.js";

export function scene_run(game: Game) {
    game.World = new World();
    game.Camera = undefined;
    game.ViewportResized = true;
    game.Gl.clearColor(0.0, 0.1, 0.2, 1);

    set_seed(Date.now());

    // Main Light.
    instantiate(game, {
        Translation: [2, 4, 3],
        Using: [light_directional([1, 1, 1], 0.3)],
    });

    let grid_size = 16;
    let ground_size = grid_size * 10;

    instantiate(game, {
        Using: [control_move([0, 0, -1], null), move(PLAYER_SPEED, 0)],
        Children: [
            // VR Camera.
            blueprint_viewer(game, 3),

            // Moon.
            blueprint_moon(),

            // Police car spawner.
            {
                Using: [control_move(null, [0, 1, 0, 0]), move(0, 1)],
                Children: [
                    {
                        Translation: [0, 0, -4],
                        Using: [
                            control_spawn(blueprint_police, 14),
                            control_move(null, [0, 1, 0, 0]),
                            move(0, 5),
                        ],
                    },
                ],
            },

            // Helicopter spawner.
            {
                Translation: [0, 10, 0],
                Using: [control_move(null, [0, 1, 0, 0]), move(0, 0.5)],
                Children: [
                    {
                        Translation: [0, 0, -10],
                        Using: [control_spawn(blueprint_helicopter, 22)],
                    },
                ],
            },

            // Missile spawner.
            {
                Translation: [0, 5, MISSILE_SPAWN_Z],
                Using: [control_move(null, [0, 1, 0, 0]), move(0, 2)],
                Children: [
                    {
                        Translation: [0, 0, -25],
                        Rotation: from_euler([0, 0, 0, 0], -60, 0, 0),
                        Using: [
                            control_spawn(blueprint_missile, MISSILE_SPAWN_FREQUENCY),
                            control_move(null, [0, 1, 0, 0]),
                            move(0, 4),
                        ],
                    },
                ],
            },

            // Building spawner.
            {
                Translation: [0, 0, BUILDING_SPAWN_Z],
                Using: [control_move(null, [0, 1, 0, 0]), move(0, 7)],
                Children: [
                    {
                        Translation: [0, 0, -5],
                        Using: [
                            control_spawn(blueprint_building, BUILDING_SPAWN_FREQUENCY),
                            control_move(null, [0, 1, 0, 0]),
                            move(0, 3),
                        ],
                    },
                ],
            },

            // Ground.
            {
                Translation: [0, -0.5, 0],
                Scale: [ground_size, 1, ground_size],
                Using: [
                    collide(true, Layer.Ground, Layer.None, [ground_size, 1, ground_size]),
                    rigid_body(RigidKind.Static),
                ],
                Children: [
                    {
                        Translation: [0, 0.5, 0],
                        Using: [
                            render_textured_diffuse(
                                game.MaterialTexturedDiffuse,
                                game.MeshPlane,
                                game.Textures["noise"],
                                [0, 0.1, 0.2, 1],
                                GL_CW,
                                -0.5
                            ),
                        ],
                    },
                ],
            },
        ],
    });

    // Camera.
    instantiate(game, {
        ...blueprint_camera(game),
        Translation: [0, 10, 10],
        Rotation: from_euler([0, 0, 0, 0], 30, 180, 0),
    });
}
