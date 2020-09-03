import {get_forward, get_rotation, get_translation} from "../../common/mat4.js";
import {Vec3} from "../../common/math.js";
import {map_range} from "../../common/number.js";
import {from_euler, set as set_quat} from "../../common/quat.js";
import {ray_intersect_aabb} from "../../common/raycast.js";
import {copy, set as set_vec3} from "../../common/vec3.js";
import {Collide} from "../components/com_collide.js";
import {query_all} from "../components/com_transform.js";
import {Entity, Game} from "../game.js";
import {snd_breath} from "../sounds/snd_breath.js";
import {Has} from "../world.js";

const QUERY = Has.Transform | Has.ControlXr;

export function sys_control_xr(game: Game, delta: number) {
    if (!game.XrFrame) {
        return;
    }

    let inputs: Record<string, XRInputSource> = {};
    for (let input of game.XrFrame.session.inputSources) {
        if (input.gripSpace) {
            inputs[input.handedness] = input;
        }
    }

    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) === QUERY) {
            update(game, i, inputs);
        }
    }
}

function update(game: Game, entity: Entity, inputs: Record<string, XRInputSource>) {
    let transform = game.World.Transform[entity];
    let control = game.World.ControlXr[entity];

    if (control.Controller === "head") {
        let headset = game.XrFrame!.getViewerPose(game.XrSpace);
        transform.World = headset.transform.matrix;
        transform.Dirty = true;

        for (let emitter of query_all(game.World, entity, Has.EmitParticles)) {
            game.World.EmitParticles[emitter].Trigger = false;
        }

        let left = inputs["left"];
        let right = inputs["right"];
        if (left?.gamepad && right?.gamepad) {
            let trigger_left = left.gamepad.buttons[0];
            let trigger_right = right.gamepad.buttons[0];
            if (trigger_left?.pressed && trigger_right?.pressed) {
                let mouth = transform.Children[0];

                game.World.AudioSource[mouth].Trigger = snd_breath;

                for (let emitter of query_all(game.World, mouth, Has.EmitParticles)) {
                    game.World.EmitParticles[emitter].Trigger = true;
                }

                let mouth_transform = game.World.Transform[mouth];
                let mouth_position: Vec3 = [0, 0, 0];
                let mouth_direction: Vec3 = [0, 0, 0];
                get_translation(mouth_position, mouth_transform.World);
                get_forward(mouth_direction, mouth_transform.World);

                let colliders: Array<Collide> = [];
                for (let i = 0; i < game.World.Signature.length; i++) {
                    if (game.World.Signature[i] & Has.Collide) {
                        let collide = game.World.Collide[i];
                        if (collide.Dynamic) {
                            colliders.push(collide);
                        }
                    }
                }

                let hit = ray_intersect_aabb(colliders, mouth_position, mouth_direction);
                if (hit) {
                    let other = (hit.Collider as Collide).Entity;
                    for (let fire of query_all(game.World, other, Has.ControlFire)) {
                        game.World.ControlFire[fire].Trigger = true;
                    }
                }
            }
        }
        return;
    }

    if (control.Controller === "left") {
        let input = inputs["left"];
        if (input) {
            if (input.gamepad) {
                let squeeze = input.gamepad.buttons[1];
                if (squeeze) {
                    if (squeeze.touched) {
                        // Close the hand.
                        let hand = game.World.Transform[transform.Children[1]];
                        hand.Scale[2] = map_range(squeeze.value, 0, 1, 1, 0.5);
                        from_euler(hand.Rotation, 0, -45 * squeeze.value, 0);
                        hand.Dirty = true;
                    }

                    let grip_entity = transform.Children[0];
                    let grip_transform = game.World.Transform[grip_entity];
                    let grip_collider = game.World.Collide[grip_entity];

                    if (squeeze.pressed) {
                        if (!grip_transform.Children[0]) {
                            if (grip_collider.Collisions.length > 0) {
                                // Grab the first building.
                                let building_entity = grip_collider.Collisions[0].Other;
                                let building_transform = game.World.Transform[building_entity];

                                // Anchor the building as the second child of the hand.
                                grip_transform.Children[0] = building_entity;
                                building_transform.Parent = grip_entity;
                                set_vec3(building_transform.Translation, 0, 0, 0);
                                set_quat(building_transform.Rotation, 0, 0, 0, 1);
                                set_vec3(building_transform.Scale, 1, 1, 1);
                                building_transform.Dirty = true;

                                // Disable the rigid body.
                                game.World.Signature[building_entity] &= ~Has.RigidBody;
                            }
                        }
                    } else {
                        if (grip_transform.Children[0]) {
                            // Release the building.
                            let building_entity = grip_transform.Children[0];
                            let building_transform = game.World.Transform[building_entity];

                            grip_transform.Children.pop();
                            building_transform.Parent = undefined;
                            get_translation(building_transform.Translation, grip_transform.World);
                            get_rotation(building_transform.Rotation, grip_transform.World);
                            set_vec3(building_transform.Scale, 1, 1, 1);
                            building_transform.Dirty = true;

                            // Enable the rigid body and transfer the hand's velocity.
                            game.World.Signature[building_entity] |= Has.RigidBody;
                            copy(
                                game.World.RigidBody[building_entity].VelocityResolved,
                                game.World.RigidBody[grip_entity].VelocityIntegrated
                            );
                        }
                    }
                }
            }

            let pose = game.XrFrame!.getPose(input.gripSpace!, game.XrSpace!);
            if (pose) {
                transform.World = pose.transform.matrix;
                transform.Dirty = true;
            }
        }
        return;
    }

    if (control.Controller === "right") {
        let input = inputs["right"];
        if (input) {
            if (input.gamepad) {
                let squeeze = input.gamepad.buttons[1];
                if (squeeze) {
                    if (squeeze.touched) {
                        // Close the hand.
                        let hand = game.World.Transform[transform.Children[1]];
                        hand.Scale[2] = map_range(squeeze.value, 0, 1, 1, 0.5);
                        from_euler(hand.Rotation, 0, 45 * squeeze.value, 0);
                        hand.Dirty = true;
                    }

                    let grip_entity = transform.Children[0];
                    let grip_transform = game.World.Transform[grip_entity];
                    let grip_collider = game.World.Collide[grip_entity];

                    if (squeeze.pressed) {
                        if (!grip_transform.Children[0]) {
                            if (grip_collider.Collisions.length > 0) {
                                // Grab the first building.
                                let building_entity = grip_collider.Collisions[0].Other;
                                let building_transform = game.World.Transform[building_entity];

                                // Anchor the building as the second child of the hand.
                                grip_transform.Children[0] = building_entity;
                                building_transform.Parent = grip_entity;
                                set_vec3(building_transform.Translation, 0, 0, 0);
                                set_quat(building_transform.Rotation, 0, 0, 0, 1);
                                set_vec3(building_transform.Scale, 1, 1, 1);
                                building_transform.Dirty = true;

                                // Disable the rigid body.
                                game.World.Signature[building_entity] &= ~Has.RigidBody;
                            }
                        }
                    } else {
                        if (grip_transform.Children[0]) {
                            // Release the building.
                            let building_entity = grip_transform.Children[0];
                            let building_transform = game.World.Transform[building_entity];

                            grip_transform.Children.pop();
                            building_transform.Parent = undefined;
                            get_translation(building_transform.Translation, grip_transform.World);
                            get_rotation(building_transform.Rotation, grip_transform.World);
                            set_vec3(building_transform.Scale, 1, 1, 1);
                            building_transform.Dirty = true;

                            // Enable the rigid body and transfer the hand's velocity.
                            game.World.Signature[building_entity] |= Has.RigidBody;
                            copy(
                                game.World.RigidBody[building_entity].VelocityResolved,
                                game.World.RigidBody[grip_entity].VelocityIntegrated
                            );
                        }
                    }
                }
            }

            let pose = game.XrFrame!.getPose(input.gripSpace!, game.XrSpace!);
            if (pose) {
                transform.World = pose.transform.matrix;
                transform.Dirty = true;
            }
        }
        return;
    }
}
