import {from_euler} from "../../common/quat.js";
import {set_seed} from "../../common/random.js";
import {GL_CCW, GL_CW} from "../../common/webgl.js";
import {blueprint_building} from "../blueprints/blu_building.js";
import {blueprint_cage} from "../blueprints/blu_cage.js";
import {blueprint_camera} from "../blueprints/blu_camera.js";
import {blueprint_helicopter} from "../blueprints/blu_helicopter.js";
import {blueprint_moon} from "../blueprints/blu_moon.js";
import {blueprint_paw} from "../blueprints/blu_paw.js";
import {blueprint_police} from "../blueprints/blu_police.js";
import {collide} from "../components/com_collide.js";
import {control_move} from "../components/com_control_move.js";
import {control_spawn} from "../components/com_control_spawn.js";
import {light_directional} from "../components/com_light.js";
import {move} from "../components/com_move.js";
import {named} from "../components/com_named.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {query_all} from "../components/com_transform.js";
import {instantiate} from "../core.js";
import {Game, Layer} from "../game.js";
import {Has, World} from "../world.js";

export function scene_title(game: Game) {
    game.CurrentScene = scene_title;
    game.World = new World();
    game.Camera = undefined;
    game.ViewportResized = true;
    game.Gl.clearColor(0.0, 0.1, 0.2, 1);

    set_seed(Date.now());

    // Camera.
    instantiate(game, {
        ...blueprint_camera(game),
        Translation: [-2, 0.1, 2],
        Rotation: from_euler([0, 0, 0, 0], -15, 105, 0),
    });

    // Main Light.
    instantiate(game, {
        Translation: [2, 4, 3],
        // The helicopter needs an entity named head in the scene.
        // Has.Aim is disabled so it won't use it.
        Using: [light_directional([1, 1, 1], 0.3), named("head")],
    });

    // Ground.
    instantiate(game, {
        Translation: [0, -0.5, 1],
        Scale: [10, 1, 10],
        Using: [collide(true, Layer.Ground, Layer.None, [10, 1, 10]), rigid_body(RigidKind.Static)],
        Children: [
            {
                Using: [
                    named("base"),
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["noise"],
                        [1, 1, 1, 1],
                        GL_CW,
                        -0.5
                    ),
                ],
            },
        ],
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

    instantiate(game, {
        Translation: [1, 0.25, 1.5],
        Using: [control_move([0, 0.5, 1], null), move(0.3, 0)],
        Children: [
            {
                ...blueprint_cage(game),
                Rotation: from_euler([0, 0, 0, 0], 0, -90, 0),
            },
            {
                ...blueprint_helicopter(game),
                Translation: [-1, 1, 0.2],
                Disable: Has.Move | Has.Lifespan,
            },
        ],
    });

    instantiate(game, blueprint_moon());

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
