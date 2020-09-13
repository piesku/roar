import {Vec3} from "../../common/math.js";
import {from_euler} from "../../common/quat.js";
import {element, integer} from "../../common/random.js";
import {GL_CW} from "../../common/webgl.js";
import {blueprint_building} from "../blueprints/blu_building.js";
import {blueprint_cage} from "../blueprints/blu_cage.js";
import {blueprint_camera} from "../blueprints/blu_camera.js";
import {blueprint_helicopter} from "../blueprints/blu_helicopter.js";
import {blueprint_launch} from "../blueprints/blu_launch.js";
import {blueprint_missile} from "../blueprints/blu_missile.js";
import {blueprint_moon} from "../blueprints/blu_moon.js";
import {blueprint_police} from "../blueprints/blu_police.js";
import {blueprint_viewer} from "../blueprints/blu_viewer.js";
import {collide} from "../components/com_collide.js";
import {control_move} from "../components/com_control_move.js";
import {control_spawn} from "../components/com_control_spawn.js";
import {move} from "../components/com_move.js";
import {Name, named} from "../components/com_named.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {MISSILE_SPAWN_FREQUENCY} from "../config.js";
import {instantiate} from "../core.js";
import {Game, Layer} from "../game.js";
import {World} from "../world.js";

export function scene_grid(game: Game) {
    game.World = new World();
    game.Camera = undefined;
    game.ViewportResized = true;
    game.Gl.clearColor(0.0, 0.1, 0.2, 1);

    // Camera rig.
    instantiate(game, {
        Using: [control_move(null, [0, 1, 0, 0]), move(0, 0.02)],
        Children: [
            {
                ...blueprint_camera(game),
                Translation: [0, 10, 15],
                Rotation: from_euler([0, 0, 0, 0], 35, 180, 0),
            },
        ],
    });

    let scale = 3;

    // VR Camera.
    instantiate(game, blueprint_viewer(game, scale));

    // Moon.
    instantiate(game, blueprint_moon());

    let grid_size = 9;

    // Ground.
    instantiate(game, {
        Translation: [0, -0.5, 0],
        Scale: [99, 1, 99],
        Using: [
            named(Name.Ground),
            collide(false, Layer.Ground, Layer.None, [99, 1, 99]),
            rigid_body(RigidKind.Static),
            render_textured_diffuse(
                game.MaterialTexturedDiffuse,
                game.MeshCube,
                game.Textures["noise"],
                [1, 1, 1, 1],
                GL_CW,
                -0.5
            ),
        ],
    });

    let possible_baby_positions: Array<Vec3> = [];
    for (let z = Math.trunc(-grid_size / 2); z < grid_size / 2; z++) {
        for (let x = Math.trunc(-grid_size / 2); x < grid_size / 2; x++) {
            let height = Math.max(integer(0, 3), integer(0, 4));
            let translation: Vec3 = [
                x * 1.5 + Math.trunc(x / 3),
                height - 0.75,
                z * 1.5 + Math.trunc(z / 2),
            ];
            instantiate(game, {
                ...blueprint_building(game, height),
                Translation: [translation[0], 0, translation[2]],
            });
            if (height > 0 && Math.abs(x) > 2 && Math.abs(z) > 2) {
                possible_baby_positions.push(translation);
            }
        }
    }

    // Baby Godzilla.
    instantiate(game, {
        ...blueprint_cage(game),
        Translation: element(possible_baby_positions),
    });

    // Police car spawner.
    instantiate(game, {
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
    });

    // Helicopter spawner.
    instantiate(game, {
        Translation: [0, 2 * scale, 0],
        Using: [control_move(null, [0, 1, 0, 0]), move(0, 0.5)],
        Children: [
            {
                Translation: [0, 0, -10],
                Using: [control_spawn(blueprint_helicopter, 22)],
            },
        ],
    });

    // Missile spawner.
    instantiate(game, {
        Using: [control_move(null, [0, 1, 0, 0]), move(0, 4)],
        Children: [
            {
                Translation: [0, 1, -50],
                Rotation: from_euler([0, 0, 0, 0], -90, 0, 0),
                Using: [control_spawn(blueprint_missile, MISSILE_SPAWN_FREQUENCY)],
            },
            {
                Translation: [0, 1, -50],
                Rotation: from_euler([0, 0, 0, 0], -90, 0, 0),
                Using: [control_spawn(blueprint_launch, MISSILE_SPAWN_FREQUENCY)],
            },
        ],
    });
}
