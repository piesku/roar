import {from_euler} from "../../common/quat.js";
import {set_seed} from "../../common/random.js";
import {blueprint_camera} from "../blueprints/blu_camera.js";
import {control_move} from "../components/com_control_move.js";
import {emit_particles} from "../components/com_emit_particles.js";
import {move} from "../components/com_move.js";
import {render_particles} from "../components/com_render_particles.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {shake} from "../components/com_shake.js";
import {instantiate} from "../core.js";
import {Game} from "../game.js";
import {World} from "../world.js";

export function scene_test4(game: Game) {
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

    // Health
    instantiate(game, {
        Translation: [-1, 0, 0],
        Children: [
            {
                Rotation: from_euler([0, 0, 0, 0], 45, 0, 0),
                Using: [
                    control_move(null, [0, 1, 0, 0]),
                    move(0, 1),
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["fire"],
                        [0, 1, 0.5, 1]
                    ),
                ],
            },
            {
                Rotation: from_euler([0, 0, 0, 0], -90, 0, 0),
                Using: [
                    shake(Infinity, 0.5),
                    emit_particles(2, 0.1, 1, true),
                    render_particles(game.Textures["fire"], [0, 1, 0, 1], 10, [0, 1, 1, 1], 10),
                ],
            },
        ],
    });

    // Flame
    instantiate(game, {
        Translation: [1, 0, 0],
        Children: [
            {
                Rotation: from_euler([0, 0, 0, 0], 45, 0, 0),
                Using: [
                    control_move(null, [0, 1, 0, 0]),
                    move(0, 1),
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["fire"],
                        [1, 0.5, 0, 1]
                    ),
                ],
            },
            {
                Rotation: from_euler([0, 0, 0, 0], -90, 0, 0),
                Using: [
                    shake(Infinity, 0.5),
                    emit_particles(2, 0.1, 1, true),
                    render_particles(game.Textures["fire"], [1, 0.5, 0, 1], 10, [1, 0, 0, 1], 10),
                ],
            },
        ],
    });
}
