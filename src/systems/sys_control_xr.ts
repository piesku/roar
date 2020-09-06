import {get_forward, get_rotation, get_translation} from "../../common/mat4.js";
import {Quat, Vec3} from "../../common/math.js";
import {map_range} from "../../common/number.js";
import {conjugate, from_euler, multiply} from "../../common/quat.js";
import {ray_intersect_aabb} from "../../common/raycast.js";
import {copy, transform_point} from "../../common/vec3.js";
import {Action, dispatch} from "../actions.js";
import {Collide} from "../components/com_collide.js";
import {RigidKind} from "../components/com_rigid_body.js";
import {query_all} from "../components/com_transform.js";
import {Entity, Game, Layer} from "../game.js";
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
                let mouth = transform.Children[1];

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
                        if (
                            collide.Layers &
                            (Layer.BuildingShell | Layer.BuildingBlock | Layer.Missile)
                        ) {
                            colliders.push(collide);
                        }
                    }
                }

                let hit = ray_intersect_aabb(colliders, mouth_position, mouth_direction);
                if (hit) {
                    let other_collider = hit.Collider as Collide;
                    let other_entity = other_collider.Entity;
                    if (other_collider.Layers & Layer.Missile) {
                        dispatch(game, Action.Explode, [other_entity]);
                    } else {
                        for (let fire of query_all(game.World, other_entity, Has.ControlFire)) {
                            game.World.ControlFire[fire].Trigger = true;
                            // Just one fire is enough.
                            break;
                        }
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
                    let [
                        hand_entity,
                        grip_detector_entity,
                        grip_anchor_entity,
                    ] = transform.Children;

                    // Open or close the hand.
                    let hand_transform = game.World.Transform[hand_entity];
                    hand_transform.Scale[2] = map_range(squeeze.value, 0, 1, 1, 0.5);
                    from_euler(hand_transform.Rotation, 0, -45 * squeeze.value, 0);
                    hand_transform.Dirty = true;

                    let grip_anchor_transform = game.World.Transform[grip_anchor_entity];
                    if (squeeze.pressed) {
                        if (!grip_anchor_transform.Children[0]) {
                            let grip_detector_collider = game.World.Collide[grip_detector_entity];
                            if (grip_detector_collider.Collisions.length > 0) {
                                // Grab the first building.
                                let building_entity = grip_detector_collider.Collisions[0].Other;
                                let building_transform = game.World.Transform[building_entity];

                                if (building_transform.Parent) {
                                    // Release the building from the other hand.
                                    let other_hand_transform =
                                        game.World.Transform[building_transform.Parent];
                                    other_hand_transform.Children.pop();
                                }

                                // Parent the building at the grip anchor point.
                                grip_anchor_transform.Children[0] = building_entity;
                                building_transform.Parent = grip_anchor_entity;

                                // The building might have been anchored at the other hand, in which case
                                // its translation isn't global. Compute the global translation.
                                get_translation(
                                    building_transform.Translation,
                                    building_transform.World
                                );
                                // Compute the translation relative to this hand's anchor point.
                                transform_point(
                                    building_transform.Translation,
                                    building_transform.Translation,
                                    grip_anchor_transform.Self
                                );

                                // Compute the orientation of the building relative to the grip.
                                // Given:
                                //   qa - world orientation of the grip anchor
                                //   qb - world orientation of the building
                                //   qc - local orientation of the building as the child of the anchor
                                // We know that after grabbing:
                                //   qb = qa * qc
                                // We solve for qc maintaining the order of multiplication:
                                //   qc = invert(qa) * qb
                                // Since rotations are unit quaternions, invert() is equal to conjugate():
                                //   qc = conjugate(qa) * qb
                                let grip_world_rotation: Quat = [0, 0, 0, 0];
                                get_rotation(grip_world_rotation, grip_anchor_transform.World);
                                conjugate(grip_world_rotation, grip_world_rotation);

                                // Find out the building's rotation in the world space and compute
                                // it relative to this hand's anchor point.
                                get_rotation(building_transform.Rotation, building_transform.World);
                                multiply(
                                    building_transform.Rotation,
                                    grip_world_rotation,
                                    building_transform.Rotation
                                );

                                building_transform.Dirty = true;

                                // Switch to a kinematic rigid body.
                                let rigid_body = game.World.RigidBody[building_entity];
                                rigid_body.Kind = RigidKind.Kinematic;
                                get_translation(rigid_body.LastPosition, building_transform.World);
                            }
                        }
                    } else {
                        if (grip_anchor_transform.Children[0]) {
                            // Release the building.
                            let building_entity = grip_anchor_transform.Children[0];
                            let building_transform = game.World.Transform[building_entity];

                            // Un-parent the building.
                            grip_anchor_transform.Children.pop();
                            building_transform.Parent = undefined;

                            // Move the building into the world space.
                            get_translation(
                                building_transform.Translation,
                                building_transform.World
                            );
                            get_rotation(building_transform.Rotation, building_transform.World);
                            building_transform.Dirty = true;

                            // Switch back to a dynamic rigid body.
                            let rigid_body = game.World.RigidBody[building_entity];
                            rigid_body.Kind = RigidKind.Dynamic;
                            copy(rigid_body.VelocityResolved, rigid_body.VelocityIntegrated);
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
                    let [
                        hand_entity,
                        grip_detector_entity,
                        grip_anchor_entity,
                    ] = transform.Children;

                    // Open or close the hand.
                    let hand_transform = game.World.Transform[hand_entity];
                    hand_transform.Scale[2] = map_range(squeeze.value, 0, 1, 1, 0.5);
                    from_euler(hand_transform.Rotation, 0, 45 * squeeze.value, 0);
                    hand_transform.Dirty = true;

                    let grip_anchor_transform = game.World.Transform[grip_anchor_entity];
                    if (squeeze.pressed) {
                        if (!grip_anchor_transform.Children[0]) {
                            let grip_detector_collider = game.World.Collide[grip_detector_entity];
                            if (grip_detector_collider.Collisions.length > 0) {
                                // Grab the first building.
                                let building_entity = grip_detector_collider.Collisions[0].Other;
                                let building_transform = game.World.Transform[building_entity];

                                if (building_transform.Parent) {
                                    // Release the building from the other hand.
                                    let other_hand_transform =
                                        game.World.Transform[building_transform.Parent];
                                    other_hand_transform.Children.pop();
                                }

                                // Parent the building at the grip anchor point.
                                grip_anchor_transform.Children[0] = building_entity;
                                building_transform.Parent = grip_anchor_entity;

                                // The building might have been anchored at the other hand, in which case
                                // its translation isn't global. Compute the global translation.
                                get_translation(
                                    building_transform.Translation,
                                    building_transform.World
                                );
                                // Compute the translation relative to this hand's anchor point.
                                transform_point(
                                    building_transform.Translation,
                                    building_transform.Translation,
                                    grip_anchor_transform.Self
                                );

                                // Compute the orientation of the building relative to the grip.
                                // Given:
                                //   qa - world orientation of the grip anchor
                                //   qb - world orientation of the building
                                //   qc - local orientation of the building as the child of the anchor
                                // We know that after grabbing:
                                //   qb = qa * qc
                                // We solve for qc maintaining the order of multiplication:
                                //   qc = invert(qa) * qb
                                // Since rotations are unit quaternions, invert() is equal to conjugate():
                                //   qc = conjugate(qa) * qb
                                let grip_world_rotation: Quat = [0, 0, 0, 0];
                                get_rotation(grip_world_rotation, grip_anchor_transform.World);
                                conjugate(grip_world_rotation, grip_world_rotation);

                                // Find out the building's rotation in the world space and compute
                                // it relative to this hand's anchor point.
                                get_rotation(building_transform.Rotation, building_transform.World);
                                multiply(
                                    building_transform.Rotation,
                                    grip_world_rotation,
                                    building_transform.Rotation
                                );

                                building_transform.Dirty = true;

                                // Switch to a kinematic rigid body.
                                let rigid_body = game.World.RigidBody[building_entity];
                                rigid_body.Kind = RigidKind.Kinematic;
                                get_translation(rigid_body.LastPosition, building_transform.World);
                            }
                        }
                    } else {
                        if (grip_anchor_transform.Children[0]) {
                            // Release the building.
                            let building_entity = grip_anchor_transform.Children[0];
                            let building_transform = game.World.Transform[building_entity];

                            // Un-parent the building.
                            grip_anchor_transform.Children.pop();
                            building_transform.Parent = undefined;

                            // Move the building into the world space.
                            get_translation(
                                building_transform.Translation,
                                building_transform.World
                            );
                            get_rotation(building_transform.Rotation, building_transform.World);
                            building_transform.Dirty = true;

                            // Switch back to a dynamic rigid body.
                            let rigid_body = game.World.RigidBody[building_entity];
                            rigid_body.Kind = RigidKind.Dynamic;
                            copy(rigid_body.VelocityResolved, rigid_body.VelocityIntegrated);
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
