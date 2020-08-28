import {map_range} from "../../common/number.js";
import {from_euler} from "../../common/quat.js";
import {Entity, Game} from "../game.js";
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
        return;
    }

    if (control.Controller === "left") {
        let input = inputs["left"];
        if (input) {
            let pose = game.XrFrame!.getPose(input.gripSpace!, game.XrSpace!);
            if (pose) {
                transform.World = pose.transform.matrix;
                transform.Dirty = true;
            }

            if (input.gamepad) {
                let hand = game.World.Transform[transform.Children[0]];
                let squeeze = input.gamepad.buttons[1];
                if (squeeze?.touched) {
                    hand.Scale[2] = map_range(squeeze.value, 0, 1, 1, 0.5);
                    from_euler(hand.Rotation, 0, -45 * squeeze.value, 0);
                    hand.Dirty = true;
                }
            }
        }
        return;
    }

    if (control.Controller === "right") {
        let input = inputs["right"];
        if (input) {
            let pose = game.XrFrame!.getPose(input.gripSpace!, game.XrSpace!);
            if (pose) {
                transform.World = pose.transform.matrix;
                transform.Dirty = true;
            }

            if (input.gamepad) {
                let hand = game.World.Transform[transform.Children[0]];
                let squeeze = input.gamepad.buttons[1];
                if (squeeze?.touched) {
                    hand.Scale[2] = map_range(squeeze.value, 0, 1, 1, 0.5);
                    from_euler(hand.Rotation, 0, 45 * squeeze.value, 0);
                    hand.Dirty = true;
                }
            }
        }
        return;
    }
}
