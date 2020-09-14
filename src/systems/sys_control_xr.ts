import {get_rotation, get_translation} from "../../common/mat4.js";
import {Quat, Vec3} from "../../common/math.js";
import {map_range} from "../../common/number.js";
import {conjugate, from_axis, multiply} from "../../common/quat.js";
import {copy, transform_direction, transform_point} from "../../common/vec3.js";
import {ControlXrKind} from "../components/com_control_xr.js";
import {RigidKind} from "../components/com_rigid_body.js";
import {query_all} from "../components/com_transform.js";
import {BUILDING_LIFESPAN} from "../config.js";
import {Entity, Game} from "../game.js";
import {snd_breath} from "../sounds/snd_breath.js";
import {Has} from "../world.js";

const QUERY = Has.Transform | Has.ControlXr;
const AXIS_Y: Vec3 = [0, 1, 0];

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

    if (control.Kind === ControlXrKind.Motion) {
        let move = game.World.Move[entity];

        let bob_entity = transform.Children[0];
        let bob_transform = game.World.Transform[bob_entity];
        let head_entity = bob_transform.Children[1];
        let head_transform = game.World.Transform[head_entity];

        // Walking in the direction of looking.
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

        // Bobbing while walking.
        if (move.Directions.length > 0) {
            let bobbing_amplitude = 0.03;
            let bobbing_frequency = 5;
            let bobbing =
                (Math.sin(bobbing_frequency * transform.Translation[0]) +
                    Math.sin(bobbing_frequency * transform.Translation[2])) *
                bobbing_amplitude;
            transform.Translation[1] = bobbing;
            transform.Dirty = true;
        }
    }

    if (control.Kind === ControlXrKind.Breath) {
        game.World.Signature[entity] &= ~Has.ControlSpawn;

        for (let emitter of query_all(game.World, entity, Has.EmitParticles)) {
            game.World.EmitParticles[emitter].Trigger = false;
        }

        {
            let input = game.XrInputs["left"];
            if (input?.gamepad) {
                let trigger_left = input.gamepad.buttons[0];
                if (trigger_left?.pressed) {
                    game.World.Signature[entity] |= Has.ControlSpawn;
                    game.World.AudioSource[entity].Trigger = snd_breath;

                    for (let emitter of query_all(game.World, entity, Has.EmitParticles)) {
                        game.World.EmitParticles[emitter].Trigger = true;
                    }
                }
            }
        }

        {
            let input = game.XrInputs["right"];
            if (input?.gamepad) {
                let trigger_right = input.gamepad.buttons[0];
                if (trigger_right?.pressed) {
                    game.World.Signature[entity] |= Has.ControlSpawn;
                    game.World.AudioSource[entity].Trigger = snd_breath;

                    for (let emitter of query_all(game.World, entity, Has.EmitParticles)) {
                        game.World.EmitParticles[emitter].Trigger = true;
                    }
                }
            }
        }

        return;
    }

    if (control.Kind === ControlXrKind.Left) {
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
                    from_axis(hand_transform.Rotation, AXIS_Y, -squeeze.value);
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

                                if (game.World.Signature[building_entity] & Has.RigidBody) {
                                    // Switch to a kinematic rigid body.
                                    let rigid_body = game.World.RigidBody[building_entity];
                                    rigid_body.Kind = RigidKind.Kinematic;
                                    get_translation(
                                        rigid_body.LastPosition,
                                        building_transform.World
                                    );

                                    // Disable lifespan.
                                    game.World.Signature[building_entity] &= ~Has.Lifespan;
                                }

                                if (game.World.Signature[building_entity] & Has.Move) {
                                    game.World.Signature[building_entity] &= ~Has.Move;
                                }
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

                            if (game.World.Signature[building_entity] & Has.RigidBody) {
                                // Switch back to a dynamic rigid body.
                                let rigid_body = game.World.RigidBody[building_entity];
                                rigid_body.Kind = RigidKind.Dynamic;
                                copy(rigid_body.VelocityResolved, rigid_body.VelocityIntegrated);

                                // Enable lifespan.
                                game.World.Signature[building_entity] |= Has.Lifespan;
                                game.World.Lifespan[building_entity].Remaining = BUILDING_LIFESPAN;
                            }
                        }
                    }
                }
            }
        }
        return;
    }

    if (control.Kind === ControlXrKind.Right) {
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
                    from_axis(hand_transform.Rotation, AXIS_Y, squeeze.value);
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

                                if (game.World.Signature[building_entity] & Has.RigidBody) {
                                    // Switch to a kinematic rigid body.
                                    let rigid_body = game.World.RigidBody[building_entity];
                                    rigid_body.Kind = RigidKind.Kinematic;
                                    get_translation(
                                        rigid_body.LastPosition,
                                        building_transform.World
                                    );

                                    // Disable lifespan.
                                    game.World.Signature[building_entity] &= ~Has.Lifespan;
                                }

                                if (game.World.Signature[building_entity] & Has.Move) {
                                    game.World.Signature[building_entity] &= ~Has.Move;
                                }
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

                            if (game.World.Signature[building_entity] & Has.RigidBody) {
                                // Switch back to a dynamic rigid body.
                                let rigid_body = game.World.RigidBody[building_entity];
                                rigid_body.Kind = RigidKind.Dynamic;
                                copy(rigid_body.VelocityResolved, rigid_body.VelocityIntegrated);

                                // Enable lifespan.
                                game.World.Signature[building_entity] |= Has.Lifespan;
                                game.World.Lifespan[building_entity].Remaining = BUILDING_LIFESPAN;
                            }
                        }
                    }
                }
            }
        }
        return;
    }
}
