import {from_euler} from "../../common/quat.js";
import {cull} from "../components/com_cull.js";
import {render_textured_diffuse} from "../components/com_render_textured_diffuse.js";
import {Blueprint} from "../core.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export function blueprint_paw(game: Game, front_face: GLenum): Blueprint {
    return {
        Children: [
            {
                // Palm
                Scale: [0.05, 0.15, 0.15],
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshCube,
                        game.Textures["noise"],
                        front_face,
                        [0.1, 0.15, 0.2, 1]
                    ),
                    cull(Has.Render),
                ],
            },
            {
                // Thumb
                Translation: [-0.06, 0.09, 0.05],
                Rotation: from_euler([0, 0, 0, 0], -30, -135, 0),
                Scale: [0.03, 0.03, 0.03],
                Using: [
                    render_textured_diffuse(
                        game.MaterialTexturedDiffuse,
                        game.MeshClaw,
                        game.Textures["noise"],
                        front_face,
                        [1, 1, 0, 1]
                    ),
                    cull(Has.Render),
                ],
            },
            {
                // Finger 1
                Translation: [-0.025, 0.07, -0.13],
                Rotation: from_euler([0, 0, 0, 0], 15, 30, 0),
                Children: [
                    {
                        // Base 1
                        Scale: [0.04, 0.04, 0.07],
                        Using: [
                            render_textured_diffuse(
                                game.MaterialTexturedDiffuse,
                                game.MeshCube,
                                game.Textures["noise"],
                                front_face,
                                [0.1, 0.15, 0.2, 1]
                            ),
                            cull(Has.Render),
                        ],
                    },
                    {
                        // Claw 1
                        Translation: [-0.03, 0, -0.09],
                        Rotation: from_euler([0, 0, 0, 0], 0, -150, 90),
                        Scale: [0.03, 0.03, 0.03],
                        Using: [
                            render_textured_diffuse(
                                game.MaterialTexturedDiffuse,
                                game.MeshClaw,
                                game.Textures["noise"],
                                front_face,
                                [1, 1, 0, 1]
                            ),
                            cull(Has.Render),
                        ],
                    },
                ],
            },
            {
                // Finger 2
                Translation: [-0.025, 0.07, -0.13],
                Rotation: from_euler([0, 0, 0, 0], 15, 30, 0),
                Children: [
                    {
                        // Base 2
                        Scale: [0.04, 0.04, 0.07],
                        Using: [
                            render_textured_diffuse(
                                game.MaterialTexturedDiffuse,
                                game.MeshCube,
                                game.Textures["noise"],
                                front_face,
                                [0.1, 0.15, 0.2, 1]
                            ),
                            cull(Has.Render),
                        ],
                    },
                    {
                        // Claw 2
                        Translation: [-0.03, 0, -0.09],
                        Rotation: from_euler([0, 0, 0, 0], 0, -150, 90),
                        Scale: [0.03, 0.03, 0.03],
                        Using: [
                            render_textured_diffuse(
                                game.MaterialTexturedDiffuse,
                                game.MeshClaw,
                                game.Textures["noise"],
                                front_face,
                                [1, 1, 0, 1]
                            ),
                            cull(Has.Render),
                        ],
                    },
                ],
            },
            {
                // Finger 2
                Translation: [-0.025, 0, -0.14],
                Rotation: from_euler([0, 0, 0, 0], 0, 30, 0),
                Children: [
                    {
                        // Base 2
                        Scale: [0.04, 0.04, 0.07],
                        Using: [
                            render_textured_diffuse(
                                game.MaterialTexturedDiffuse,
                                game.MeshCube,
                                game.Textures["noise"],
                                front_face,
                                [0.1, 0.15, 0.2, 1]
                            ),
                            cull(Has.Render),
                        ],
                    },
                    {
                        // Claw 2
                        Translation: [-0.03, 0, -0.09],
                        Rotation: from_euler([0, 0, 0, 0], 0, -150, 90),
                        Scale: [0.03, 0.03, 0.03],
                        Using: [
                            render_textured_diffuse(
                                game.MaterialTexturedDiffuse,
                                game.MeshClaw,
                                game.Textures["noise"],
                                front_face,
                                [1, 1, 0, 1]
                            ),
                            cull(Has.Render),
                        ],
                    },
                ],
            },
            {
                // Finger 3
                Translation: [-0.025, -0.07, -0.13],
                Rotation: from_euler([0, 0, 0, 0], -15, 30, 0),
                Children: [
                    {
                        // Base 3
                        Scale: [0.04, 0.04, 0.07],
                        Using: [
                            render_textured_diffuse(
                                game.MaterialTexturedDiffuse,
                                game.MeshCube,
                                game.Textures["noise"],
                                front_face,
                                [0.1, 0.15, 0.2, 1]
                            ),
                            cull(Has.Render),
                        ],
                    },
                    {
                        // Claw 3
                        Translation: [-0.03, 0, -0.09],
                        Rotation: from_euler([0, 0, 0, 0], 0, -150, 90),
                        Scale: [0.03, 0.03, 0.03],
                        Using: [
                            render_textured_diffuse(
                                game.MaterialTexturedDiffuse,
                                game.MeshClaw,
                                game.Textures["noise"],
                                front_face,
                                [1, 1, 0, 1]
                            ),
                            cull(Has.Render),
                        ],
                    },
                ],
            },
        ],
    };
}
