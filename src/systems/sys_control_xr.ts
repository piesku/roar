import {get_rotation, get_translation} from "../../common/mat4.js";
import {Quat, Vec3} from "../../common/math.js";
import {map_range} from "../../common/number.js";
import {conjugate, from_euler, multiply} from "../../common/quat.js";
import {copy, transform_direction, transform_point} from "../../common/vec3.js";
import {RigidKind} from "../components/com_rigid_body.js";
import {query_all} from "../components/com_transform.js";
import {Entity, Game} from "../game.js";
import {snd_breath} from "../sounds/snd_breath.js";
import {Has} from "../world.js";

const QUERY = Has.Transform | Has.ControlXr;

export function sys_control_xr(game: Game, delta: number) {
    if (!game.XrFrame) {
        return;
    }

    game.XrInputs = {};
    for (let input of game.XrFrame.session.inputSources) {
        if (input.gripSpace) {
            game.XrInputs[input.handedness] = input;
        }
    }

    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) === QUERY) {
            update(game, i);
        }
    }
}

function update(game: Game, entity: Entity) {
    let transform = game.World.Transform[entity];
    let control = game.World.ControlXr[entity];

    if (control.Controller === "motion") {
        let move = game.World.Move[entity];
        let head_entity = transform.Children[1];
        let head_transform = game.World.Transform[head_entity];

        let left = game.XrInputs["left"];
        if (left?.gamepad) {
            let axis_strafe = left.gamepad.axes[2];
            if (axis_strafe) {
                let direction: Vec3 = [axis_strafe, 0, 0];
                transform_direction(direction, direction, head_transform.World);
                direction[1] = 0;
                move.Directions.push(direction);
            }
            let axis_forward = left.gamepad.axes[3];
            if (axis_forward) {
                let direction: Vec3 = [0, 0, axis_forward];
                transform_direction(direction, direction, head_transform.World);
                direction[1] = 0;
                move.Directions.push(direction);
            }
        }
        let right = game.XrInputs["right"];
        if (right?.gamepad) {
            let axis_strafe = right.gamepad.axes[2];
            if (axis_strafe) {
                let direction: Vec3 = [axis_strafe, 0, 0];
                transform_direction(direction, direction, head_transform.World);
                direction[1] = 0;
                move.Directions.push(direction);
            }
            let axis_forward = right.gamepad.axes[3];
            if (axis_forward) {
                let direction: Vec3 = [0, 0, axis_forward];
                transform_direction(direction, direction, head_transform.World);
                direction[1] = 0;
                move.Directions.push(direction);
            }
        }
    }

    if (control.Controller === "breath") {
        game.World.Signature[entity] &= ~Has.ControlSpawn;

        for (let emitter of query_all(game.World, entity, Has.EmitParticles)) {
            game.World.EmitParticles[emitter].Trigger = false;
        }

        let left = game.XrInputs["left"];
        let right = game.XrInputs["right"];
        if (left?.gamepad && right?.gamepad) {
            let trigger_left = left.gamepad.buttons[0];
            let trigger_right = right.gamepad.buttons[0];
            if (trigger_left?.pressed && trigger_right?.pressed) {
                game.World.Signature[entity] |= Has.ControlSpawn;
                game.World.AudioSource[entity].Trigger = snd_breath;

                for (let emitter of query_all(game.World, entity, Has.EmitParticles)) {
                    game.World.EmitParticles[emitter].Trigger = true;
                }
            }
        }
        return;
    }

    if (control.Controller === "left") {
        let input = game.XrInputs["left"];
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

                                // Disable lifespan.
                                game.World.Signature[building_entity] &= ~Has.Lifespan;
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

                            // Enable lifespan.
                            game.World.Signature[building_entity] |= Has.Lifespan;
                        }
                    }
                }
            }
        }
        return;
    }

    if (control.Controller === "right") {
        let input = game.XrInputs["right"];
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

                                // Disable lifespan.
                                game.World.Signature[building_entity] &= ~Has.Lifespan;
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

                            // Enable lifespan.
                            game.World.Signature[building_entity] |= Has.Lifespan;
                        }
                    }
                }
            }
        }
        return;
    }
}
