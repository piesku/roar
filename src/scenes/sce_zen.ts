import {from_euler} from "../../common/quat.js";
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
import {lifespan} from "../components/com_lifespan.js";
import {move} from "../components/com_move.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {MISSILE_SPAWN_FREQUENCY, MISSILE_SPAWN_Z} from "../config.js";
import {instantiate} from "../core.js";
import {Game, Layer} from "../game.js";
import {World} from "../world.js";

export function scene_zen(game: Game) {
    game.World = new World();
    game.Camera = undefined;
    game.ViewportResized = true;
    game.Gl.clearColor(0.0, 0.1, 0.2, 1);

    let grid_size = 16;
    let ground_size = grid_size * 10;

    instantiate(game, {
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
                Using: [control_move(null, [0, 1, 0, 0]), move(0, 37), lifespan(1)],
                Children: [
                    {
                        Translation: [0, 0, -2],
                        Using: [control_move([0, 0, -1], null), move(2, 0)],
                        Children: [
                            {
                                Using: [
                                    control_spawn(blueprint_building, 0.05),
                                    control_move(null, [0, 1, 0, 0]),
                                    move(0, 3),
                                ],
                            },
                            {
                                Translation: [1, 0, -1],
                                Using: [
                                    control_spawn(blueprint_building, 0.1),
                                    control_move(null, [0, 1, 0, 0]),
                                    move(0, 3),
                                ],
                            },
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
                        Using: [
                            render_textured_diffuse(
                                game.MaterialTexturedDiffuse,
                                game.MeshCube,
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
        Rotation: from_euler([0, 0, 0, 0], 35, 180, 0),
    });
}
