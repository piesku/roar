import {Camera} from "./components/com_camera.js";
import {Collide} from "./components/com_collide.js";
import {ControlRotate} from "./components/com_control_rotate.js";
import {ControlXr} from "./components/com_control_xr.js";
import {Light} from "./components/com_light.js";
import {Move} from "./components/com_move.js";
import {Render} from "./components/com_render.js";
import {RigidBody} from "./components/com_rigid_body.js";
import {Shake} from "./components/com_shake.js";
import {Transform} from "./components/com_transform.js";

const enum Component {
    Camera,
    Collide,
    ControlRotate,
    ControlXr,
    Light,
    Move,
    Render,
    RigidBody,
    Shake,
    Transform,
}

export const enum Has {
    Camera = 1 << Component.Camera,
    Collide = 1 << Component.Collide,
    ControlRotate = 1 << Component.ControlRotate,
    ControlXr = 1 << Component.ControlXr,
    Light = 1 << Component.Light,
    Move = 1 << Component.Move,
    Render = 1 << Component.Render,
    RigidBody = 1 << Component.RigidBody,
    Shake = 1 << Component.Shake,
    Transform = 1 << Component.Transform,
}

export class World {
    // Component flags
    Signature: Array<number> = [];
    // Component data
    Camera: Array<Camera> = [];
    Collide: Array<Collide> = [];
    ControlRotate: Array<ControlRotate> = [];
    ControlXr: Array<ControlXr> = [];
    Light: Array<Light> = [];
    Move: Array<Move> = [];
    Render: Array<Render> = [];
    RigidBody: Array<RigidBody> = [];
    Shake: Array<Shake> = [];
    Transform: Array<Transform> = [];
}
