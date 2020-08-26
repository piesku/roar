import {Camera} from "./components/com_camera.js";
import {Collide} from "./components/com_collide.js";
import {ControlXr} from "./components/com_control_xr.js";
import {Light} from "./components/com_light.js";
import {Render} from "./components/com_render.js";
import {RigidBody} from "./components/com_rigid_body.js";
import {Transform} from "./components/com_transform.js";

const enum Component {
    Camera,
    Collide,
    ControlXr,
    Light,
    Render,
    RigidBody,
    Transform,
}

export const enum Has {
    Camera = 1 << Component.Camera,
    Collide = 1 << Component.Collide,
    ControlXr = 1 << Component.ControlXr,
    Light = 1 << Component.Light,
    Render = 1 << Component.Render,
    RigidBody = 1 << Component.RigidBody,
    Transform = 1 << Component.Transform,
}

export class World {
    // Component flags
    Signature: Array<number> = [];
    // Component data
    Camera: Array<Camera> = [];
    Collide: Array<Collide> = [];
    ControlXr: Array<ControlXr> = [];
    Light: Array<Light> = [];
    Render: Array<Render> = [];
    RigidBody: Array<RigidBody> = [];
    Transform: Array<Transform> = [];
}
