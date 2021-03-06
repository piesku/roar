import {from_euler} from "../../common/quat.js";
import {GL_CCW, GL_CW} from "../../common/webgl.js";
import {blueprint_building} from "../blueprints/blu_building.js";
import {blueprint_cage} from "../blueprints/blu_cage.js";
import {blueprint_camera} from "../blueprints/blu_camera.js";
import {blueprint_helicopter} from "../blueprints/blu_helicopter.js";
import {blueprint_moon} from "../blueprints/blu_moon.js";
import {blueprint_paw} from "../blueprints/blu_paw.js";
import {blueprint_police} from "../blueprints/blu_police.js";
import {audio_source} from "../components/com_audio_source.js";
import {collide} from "../components/com_collide.js";
import {control_move} from "../components/com_control_move.js";
import {control_spawn} from "../components/com_control_spawn.js";
import {move} from "../components/com_move.js";
import {Name, named} from "../components/com_named.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {query_all} from "../components/com_transform.js";
import {instantiate} from "../core.js";
import {Game, Layer} from "../game.js";
import {snd_soundtrack} from "../sounds/snd_soundtrack.js";
import {Has, World} from "../world.js";

export function scene_title(game: Game) {
    game.World = new World();
    game.Camera = undefined;
    game.ViewportResized = true;
    game.Gl.clearColor(0.0, 0.1, 0.2, 1);

    // Camera.
    instantiate(game, {
        ...blueprint_camera(game),
        Translation: [-2, 0.1, 2],
        Rotation: from_euler([0, 0, 0, 0], -15, 105, 0),
    });

    // Ground.
    instantiate(game, {
        Translation: [0, -0.5, 0],
        Scale: [99, 1, 99],
        Using: [
            named(Name.Ground),
            audio_source(false, snd_soundtrack()),
            collide(false, Layer.Ground, Layer.None, [99, 1, 99]),
            rigid_body(RigidKind.Static),
            render_textured_diffuse(
                game.MaterialTexturedDiffuse,
                game.MeshCube,
                game.Textures["noise"],
                [1, 1, 1, 1],
                GL_CW,
                -0.3
            ),
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
        // The helicopter needs an entity named head in the scene.
        // Has.Aim is disabled so it won't use it.
        Using: [named(Name.Head)],
        Translation: [3, 2, 1],
        Rotation: from_euler([0, 0, 0, 0], 30, 180, 0),
        Scale: [-5, 5, 5],
    });

    instantiate(game, {
        Translation: [0, 0.25, 2],
        Using: [named(Name.IntroHelicopter), control_move([0, 0.5, 1], null), move(0.5, 0)],
        Disable: Has.Move,
        Children: [
            {
                ...blueprint_cage(game),
                Rotation: from_euler([0, 0, 0, 0], 0, -90, 0),
            },
            {
                ...blueprint_helicopter(game),
                Translation: [-1, 0.5, 0.1],
                Disable: Has.Move | Has.Lifespan,
            },
        ],
    });

    instantiate(game, blueprint_moon());

    instantiate(
        game,
        // Police car spawner.
        {
            Using: [named(Name.Base), control_move(null, [0, 1, 0, 0]), move(0, 1)],
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
