import {from_euler} from "../../common/quat.js";
import {set_seed} from "../../common/random.js";
import {GL_CCW, GL_CW} from "../../common/webgl.js";
import {blueprint_building} from "../blueprints/blu_building.js";
import {blueprint_camera} from "../blueprints/blu_camera.js";
import {blueprint_moon} from "../blueprints/blu_moon.js";
import {blueprint_paw} from "../blueprints/blu_paw.js";
import {blueprint_police} from "../blueprints/blu_police.js";
import {collide} from "../components/com_collide.js";
import {control_move} from "../components/com_control_move.js";
import {control_spawn} from "../components/com_control_spawn.js";
import {light_directional} from "../components/com_light.js";
import {move} from "../components/com_move.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {query_all} from "../components/com_transform.js";
import {instantiate} from "../core.js";
import {Game, Layer} from "../game.js";
import {Has, World} from "../world.js";

export function scene_title(game: Game) {
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

    // Ground.
    instantiate(game, {
        Translation: [0, -0.5, 0],
        Scale: [10, 1, 10],
        Using: [collide(true, Layer.Ground, Layer.None, [10, 1, 10]), rigid_body(RigidKind.Static)],
        Children: [
            {
                Translation: [0, 0.5, 0],
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshPlane,
                        game.Textures["noise"],
                        GL_CW,
                        [0, 0.1, 0.2, 1],
                        -0.5
                    ),
                ],
            },
        ],
    });

    // Camera.
    instantiate(game, {
        ...blueprint_camera(game),
        Translation: [-2, 0.1, 2],
        Rotation: from_euler([0, 0, 0, 0], -15, 105, 0),
    });

    instantiate(game, {
        ...blueprint_building(game),
        Translation: [0, 0, 0],
    });

    instantiate(game, {
        ...blueprint_building(game),
        Translation: [1.1, 0, 0],
    });

    let last_building = instantiate(game, {
        ...blueprint_building(game),
        Translation: [2.2, 0, 0],
    });

    for (let fire of query_all(game.World, last_building, Has.ControlFire)) {
        game.World.Signature[fire] &= ~Has.ControlFire;
    }

    instantiate(game, {
        ...blueprint_paw(game, GL_CCW),
        Translation: [3, 2, 1],
        Rotation: from_euler([0, 0, 0, 0], 30, 180, 0),
        Scale: [-5, 5, 5],
    });

    instantiate(game, blueprint_moon(game));

    instantiate(
        game,
        // Police car spawner.
        {
            Using: [control_move(null, [0, 1, 0, 0]), move(0, 1)],
            Children: [
                {
                    Translation: [0, 0, -4],
                    Using: [
                        control_spawn(blueprint_police, 11),
                        control_move(null, [0, 1, 0, 0]),
                        move(0, 5),
                    ],
                },
            ],
        }
    );
}
